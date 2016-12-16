var stripe = require("stripe")("sk_test_lQ7nkm7GhFinb9bVlCAHWl9x");

exports.charge = function(req, res) {
  var stripeToken = req.body.stripeToken;
  var user = req.user;

  console.log('charge: ', stripeToken);
   
  var charge = stripe.charges.create({
    amount: 1000, //amount in cents
    currency: "usd",
    card: stripeToken,
    description: "payinguser@example.com"
  }, function(err, charge) {
      if (err && err.type === 'StripeCardError') {
        res.status(401).send('Payment denied'); 
      }
      
      user.subscribed = true;

      user.save(function(err) {
        if (err) {
          return res.send(err);
        }

        res.json({ success: true });
      })
  });

};