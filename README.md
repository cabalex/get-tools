# [GET Tools](https://cabalex.github.io/get-tools)

Tools for interacting with CBORD's GET app, featuring:

- Detailed spending analytics
- QR code generation
- Custom deposit amounts _(saved cards only)_
- Code sharing

This app is not affiliated with CBORD or GET. It's just a passion project for fun!

## Security

**You should know that giving account access to any external program comes with risks.** A service like this could easily run off with your points, and if it's hosted outside of a site like `github.io` (where you can directly see the source code), you can't be sure that it won't. _Never, ever_ give services access to sensitive information without knowing what they will do, and how they will handle your data.

GET Tools works entirely on your device by hooking into the GET app's API. This API is exposed with Cross-Origin Resource Sharing (CORS) headers - for non-nerds, that means your phone (computer, smart fridge, etc) can send data directly to GET _without passing through an external server._ Nothing is sent to me, and I can't see any of your data.

The website is completely static here on GitHub - it's just HTML, JS, and CSS being served on the internet. There's no secret backend server, no databases, no account system, and there never will be. Your API key and everything personal is stored on your device, and you can delete that data at any time by clearing the site's data in your browser.

Still hesitant? Good! I encourage you to Inspect Element and check the Network tab to see what's actually being sent back and forth. You can also poke around in [my code](https://github.com/cabalex/get-tools/blob/main/src/getStore.ts) and see what it does. That's the magic of open source!

I created this app for my own benefit, wanting more out of the official app that CBORD provides. I'm sharing it for my own convenience (I like hosting on GitHub 😀), and you're welcome to use it too, but please note **this app is provided as-is, and I do not take any responsibility for any action caused by the usage of this app, whether by you or by other users.**

## FAQ

### Can GET Tools see my credit cards?

GET Tools will never be able to see your full payment information. All that it can do is:

- See the cardholder's name and last four digits
- Deposit money into one of your accounts using a saved payment method (in-app confirmation required)
- Remove payment methods from your account

None of this data is saved. GET Tools fetches this data every time you reload the page.

If this sounds scary, I recommend you remove **all** payment methods from your GET account before linking. And **if you're sharing a code, you should always remove them!** (There's even a handy button to do so!)

### What gets shared when I share a code?

When sharing codes, a new "device" is created with a specific ID and PIN, which is able to be revoked at any time. **Treat this like other people logging into your GET account.**

Since there isn't any way to only partially access an account, it is possible to get full account access through these codes, so _only share them with people you really trust_! I am **not** responsible for other people misusing the codes you share.

### Can GET Tools transfer balances between accounts?

No. The API explicitly blocks this.
