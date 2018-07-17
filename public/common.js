// common JS utils shared among demo apps
l = console.log;

// pointing browser SDK to user node
Opts = { local_fair_rpc: "http://127.0.0.1:8001" };

var fallback = setTimeout(() => {
  //main.innerHTML="Couldn't connect to local node at "+Opts.local_fair_rpc+". <a href='https://fairlayer.com/#install'>Please install Fairlayer first</a>"
}, 3000);

commy = (b, dot = true) => {
  let prefix = b < 0 ? "-" : "";

  b = Math.abs(b).toString();
  if (dot) {
    if (b.length == 1) {
      b = "0.0" + b;
    } else if (b.length == 2) {
      b = "0." + b;
    } else {
      var insert_dot_at = b.length - 2;
      b = b.slice(0, insert_dot_at) + "." + b.slice(insert_dot_at);
    }
  }
  return prefix + b.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

escapeHTML = str => {
  var tagsToReplace = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;"
  };
  return str.replace(/[&<>]/g, function(tag) {
    return tagsToReplace[tag] || tag;
  });
};

checkLoginState = r => {
  l(r);
};

load = async function() {
  let r = (await axios.post("/rpc", {
    auth_token: localStorage.auth_token,
    method: "load"
  })).data;

  l(r);

  if (r.auth_token) {
    localStorage.auth_token = r.auth_token;
  }

  Opts.our_address = r.our_address;
  Opts.user = r.user;
  Opts.assets = r.assets;

  deposit.innerHTML = Opts.our_address + "#" + Opts.user.id;

  var getAsset = assetId => {
    if (!Opts.user.balances) return 0;

    let bal = Opts.user.balances.find(b => b.asset == assetId);

    return bal ? bal.balance : 0;
  };

  // invoice can also be included as #hash to the address

  let html = "";
  for (var a of Opts.assets) {
    html += `<option value="${a.id}">${escapeHTML(a.name)} (${escapeHTML(
      a.ticker
    )}): ${commy(getAsset(a.id))}</option>`;
  }

  if (picker.innerHTML != html) picker.innerHTML = html;
};

window.onload = () => {
  picker.onchange = e => (localStorage.last_asset = picker.value);
  picker.value = localStorage.last_asset ? localStorage.last_asset : "1";

  withdraw.onclick = function() {
    axios
      .post("/rpc", {
        auth_token: localStorage.auth_token,
        method: "send",
        address: address.value,
        amount: amount.value,
        asset: parseInt(picker.value)
      })
      .then(r => {
        if (r.data.status == "paid") {
          alert("Sent!");
          load();
        } else {
          alert(r.data.error);
        }
      });
  };

  faucet.onclick = () => {
    let hub =
      location.hostname == "web.fairlayer.com"
        ? "https://fairlayer.com"
        : "http://127.0.0.1";
    axios.get(
      hub +
        `:8100/faucet?address=${encodeURIComponent(deposit.innerHTML)}&amount=${
          faucet_amount.value
        }&asset=${picker.value}`
    );
    //setTimeout(load, 1000);
  };

  deposit.onclick = function() {
    Opts.fair_w = window.open(
      Opts.local_fair_rpc +
        "#wallet?address=" +
        Opts.our_address +
        "&invoice=" +
        Opts.user.id +
        "&asset=" +
        picker.value +
        "&editable=amount"
    );

    window.addEventListener("message", function(e) {
      if (e.origin != Opts.local_fair_rpc) return;

      // the wallet claims the payment has gone through
      if (e.data.status == "paid") {
        Opts.fair_w.close();
        setTimeout(() => {
          load();
        }, 1300);
      } else if (e.data.status == "login") {
        // login token shared
      }
    });
  };

  load();
};

setInterval(load, 1000);
