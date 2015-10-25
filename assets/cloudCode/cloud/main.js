
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success({one: "Hello big world!", two: "Good Bye"});
});

Parse.Cloud.define("averageRating", function(request, response) {
  var Product = Parse.Object.extend("Product");
  var productQuery = new Parse.Query(Product);
  productQuery.equalTo('objectId', request.params.productID);
  productQuery.find().then(function(products) {
  	var Review = Parse.Object.extend("Review");
	  var reviewQuery = new Parse.Query(Review);
	  reviewQuery.equalTo('product', products[0]);
	  reviewQuery.find().then(function(results) {
	  	var total = results.length;
	    var sum = 0;
	    for (var i = 0; i < total; ++i) {
	      sum += results[i].get("rating");
	    }
	    if (total == 0) total = 1;
	    response.success({average:(sum / total), total: (total), productID: request.params.productID});
	  }, function(error) {
	  	response.error("product lookup failed " + request.params.productID + " " + error.message);
	  });
  }, function(error) {
    response.error("review lookup failed " + request.params.productID + " " + error.message);
  });
});