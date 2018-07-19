// fair demo for JS
axios = require("axios");
l = console.log;
crypto = require("crypto");
rand = () => crypto.randomBytes(6).toString("hex");

fs = require("fs");

Opts = {};

// include db schemes
require("./db");
process.on("unhandledRejection", l);
process.on("uncaughtException", l);

// define merchant node path
if (fs.existsSync("/root/fair/data8002/offchain/pk.json")) {
  fair_path = "/root/fair/data8002/offchain";
  our_fair_rpc = "http://127.0.0.1:8202/rpc";
} else {
  fair_path = "/Users/homakov/work/fair/data8002/offchain";
  our_fair_rpc = "http://127.0.0.1:8002/rpc";
}

processUpdates = async () => {
  r = await Fair("receivedAndFailed");

  if (!r.data.receivedAndFailed) return l("No receivedAndFailed");

  for (let obj of r.data.receivedAndFailed) {
    //if (obj.asset != 1) return // only FRD accepted
    l(obj);

    if (!obj.invoice) return;

    let uid = parseInt(
      Buffer.from(obj.invoice, "hex")
        .slice(1)
        .toString()
    );

    if (!Number.isInteger(uid)) return;

    let receiver = await User.findById(uid, { include: [{ all: true }] });

    // checking if uid is valid
    if (receiver) {
      l(receiver.id, obj.is_inward ? " receive" : " refund");

      let bal = receiver.balances.find(b => b.asset == obj.asset);

      // add to existing Balance
      if (bal) {
        bal.balance += obj.amount;
        await bal.save();
      } else {
        // create new record
        await receiver.createBalance({
          asset: obj.asset,
          balance: obj.amount
        });
      }
    } else {
      l("No such user " + uid);
    }
  }

  setTimeout(processUpdates, 1000);
};

Fair = (method, params = {}) => {
  return axios.post(our_fair_rpc, {
    method: method,
    auth_code: auth_code,
    params: params
  });
};

httpcb = async (req, res) => {
  if (req.url == "/rpc") {
    let queryData = "";
    req.on("data", function(data) {
      queryData += data;
    });

    req.on("end", async function() {
      res.status = 200;

      let p = JSON.parse(queryData);
      let respond = json => {
        // global vars
        json.assets = Opts.assets;
        json.our_address = Opts.our_address;

        if (json.user) {
          json.auth_token = json.user.auth_token.toString("hex");
        }

        res.end(JSON.stringify(json));
      };

      if (!p.auth_token) {
        let user = await User.create({
          auth_token: crypto.randomBytes(32)
        });

        return respond({ user: user });
      }

      let user = await User.find({
        where: { auth_token: Buffer.from(p.auth_token, "hex") },
        include: [{ all: true }]
      });

      if (!user) return respond({ error: "fail_auth" });

      if (p.method == "send") {
        let amount = Math.round(parseFloat(p.amount) * 100);

        let bal = user.balances.find(b => b.asset == p.asset);

        // todo: add transactions

        if (!bal || bal.balance < amount) {
          l("Not enough balance: ", bal, p.asset);
          return false;
        }

        let [addr, hash] = p.address.split("#");

        // if destination is under same custodian, send internally with 0 fee
        if (addr == Opts.our_address) {
          let dest = parseInt(hash);
          if (user.id == dest) {
            return respond({ status: "paying_self" });
          }

          let target = (await Balance.findOrBuild({
            where: {
              userId: dest,
              asset: p.asset
            }
          }))[0];

          target.balance += amount;

          await target.save();

          bal.balance -= amount;
          await bal.save();
        } else {
          // send through Fair network to external address
          bal.balance -= amount;
          await bal.save();

          r = await Fair("send", {
            address: p.address,
            amount: amount,
            asset: p.asset
          });
          l(r.data);
        }

        // if fail, do not withdraw?
        respond({ status: "paid" });
      } else if (p.method == "load") {
        respond({ user: user });
      }
    });
  } else if (req.url.length > 4 && !req.url.includes(".")) {
    // long and no dots, looks like a username
  } else {
    require("serve-static")(require("path").resolve(__dirname, "public"))(
      req,
      res,
      require("finalhandler")(req, res)
    );
  }
};

init = async () => {
  await sequelize.sync({ force: false });

  if (fs.existsSync(fair_path + "/pk.json")) {
    auth_code = JSON.parse(fs.readFileSync(fair_path + "/pk.json")).auth_code;
    l("Auth code to our node: " + auth_code);
  } else {
    l("No auth");
    return setTimeout(init, 1000);
  }

  r = await Fair("getinfo");
  if (!r.data.address) {
    l("No address");
    return setTimeout(init, 1000);
  }

  Opts.our_address = r.data.address;

  // filter for assets you support
  let whitelist = [1, 2, 5];
  Opts.assets = r.data.assets.filter(a => whitelist.includes(a.id));

  l("Our address: " + Opts.our_address);
  l("URL: http://127.0.0.1:3010");
  processUpdates();

  require("http")
    .createServer(httpcb)
    .listen(3010);

  /*
  try{
    require('../lib/opn')('http://127.0.0.1:3010')
  } catch(e){} */
};

init();

repl = require("repl").start();
