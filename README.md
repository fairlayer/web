There are two types of wallets that serve the opposite goals.

The Core wallet runs locally, has decentralized install and all updates are delivered through onchain governance, giving you maximum security. However, it's harder to not forget the password and understand the complexity of the UI.

So Web wallet serves as user-friendly catch-all solution for everyone else, who is unable to install or cannot understand Core wallet.

We do not believe anything should exist in between (blockchain mobile apps make no sense, desktop light clients are insecure), and our end goal is to bring as many users as possible to Core version with all the benefits, where Web is used for pocket change.

| Compare                  | Fair Core                                                                                                                       | Fair Web                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Optimized for            | Maximum Security                                                                                                                | Maximum Convenience                                                                                                   |
| Audience                 | Individuals who have a laptop or can buy one, businesses, servers, merchants. Suitable for $5,000 and above                     | Non-tech savvy users, mobile clients, beginners. Suitable for $5,000 and below                                        |
| Authentication           | Username+Password, no recovery                                                                                                  | By email or any social media                                                                                          |
| Platforms                | Linux/macOS/Windows (servers and desktops)                                                                                      | All platforms with a web browser                                                                                      |
| Decentralized install    | Yes (optional)                                                                                                                  | No install - just a web app                                                                                           |
| Tech stack               | Client side Node.js server                                                                                                      | Progressive Web Application                                                                                           |
| Tech Requirements        | When gets popular, will consume 1-5 Gb of space and 5 Gb of bandwidth per month (negligible for a laptop)                       | Nothing is stored or processed                                                                                        |
| Receive payments offline | No                                                                                                                              | Yes                                                                                                                   |
| Ownership of fund        | Only your personal device                                                                                                       | Funds belong to single custodian (the server of web wallet) and can be deleted any second: same as paypal or any bank |
| Types of assets          | All assets                                                                                                                      | All assets allowed by this custodian                                                                                  |
| Open-source              | Yes                                                                                                                             | Yes                                                                                                                   |
| UX exposed               | Credit limits, choose hubs, choose assets, rebalances, withdrawal and deposits, send money offchain, disputes, onchain exchange | Choose assets, send money offchain                                                                                    |

# How to deploy your own

Everyone is encouraged to deploy this web wallet on their server. If you're tech-savvy you can use it on your mobile devices and avoid counterparty risks with the `web.fairlayer.com` public service.

This service automatically looks for working Fair Core on the same machine. Now all payments received by Core will be deposited to corresponding accounts inside the Web wallet.

All transfers within same wallet are instant and do not call Core daemon.

```
npm install
node app
#go to http://127.0.0.1:3010
```

1.  Go to https://developers.facebook.com/?ref=pf

2.  Create new app

```
npm i sqlite3 axios sequelize
```
