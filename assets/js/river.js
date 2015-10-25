$(document).ready(function() {
  parseObject.initialize();
  page.reload();

  $('#searchForm').submit(function() {
  	var searchString = $('#search').val();
    window.location.href = "./#/search/" + searchString.split(' ').join('-');
    return false;
  });
  $(window).bind( 'hashchange', function(e) {page.reload(); });

});

var page = (function () {
  var self = {};

  self.reload  = function() {
    var query = window.location.hash.substr(1);
    //console.log('query: ' + query);
    var page = query.split('/')[1];
    var item = query.split('/')[2];
    //console.log('page: ' + page);
    if (page == 'search') {
      //console.log('search');
      search.searchAll(item.split('-'));
    } else if (page == 'product') {
      //console.log('product');
      if (item == 'add') {
        parseObject.addProduct();
      } else if (item == 'all' || item == '') {
        parseObject.allProducts();
      } else {
        parseObject.product(item);
      }
    } else if (page == 'dept') {
    	if (item) {
    		parseObject.department(item);
    	} else{
    		parseObject.department('all');
    	};
    } else if (page == 'account') {
    	parseObject.account();
    } else{
      //console.log('main');
      main.load();
    }
  }

  self.error = function(error) {
  	console.log(error);
  	console.log('There was an ERROR: ' + error.message);
  	console.log(stack);
  }

  return self;
}());

var parseObject = (function () {
  var self = {};

  var Product;
  var Review;
  var Category;
  var ImageObject;

  self.initialize = function() {initialize();}
  var initialize = function() {
    Parse.initialize("0kAbqraYuEVB2Wr8ZihnGtmASPId34SJyzFkHyEo", "a6rw0cA6myWnM3SZ7PfH0LiyUibcXatTlhcYB91f");
    Product = Parse.Object.extend('Product');
    Review = Parse.Object.extend('Review');
    Category = Parse.Object.extend('Category');
    ImageObject = Parse.Object.extend('Image');

    $.fn.raty.defaults.starType = 'i';

    checkUser();
  }

  var checkUser = function() {
    //console.log(Parse.User.current());
    if (Parse.User.current() == null) {
      //console.log('null user');
      var loginIcon = $('<span>').addClass('glyphicon glyphicon-log-in').attr('aria-hidden',"true");
      var a = $('<a>').append(loginIcon).append(' Login').addClass('btn').click(loginSignupPlain);
      $('#loginField').html(a);
    } else{
      //console.log('user not null');
      if (!Parse.User.current().get('fname')) {
        var name = Parse.User.current().get('username');
        } else{
        var name = Parse.User.current().get('fname')+' '+Parse.User.current().get('lname');
      };
      $('#loginField').load('assets/html/loggedinMenu.html', function() {
      	$('#nameField').html(name);
      	$('#logoutButon').click(logout);
      }).addClass('dropdown');
    };
  }

  var loginSignupPlain = function() {loginSignup('','');}
  var loginSignup = function(messageToUser, type) {
    bootbox.dialog({
      message: '<div id="loginSignup"></div>',
      title: 'Welcome to River',
      buttons: {
        facebook: {
          label: "Login with Facebook",
          className: "btn-primary",
          callback: function() {
            console.log("Facebook");
          }
        },
      }
    });
    $('#loginSignup').load('assets/html/loginSignup.html', function() {
      if (messageToUser != '') {
        var alert = $('<div>').addClass('alert alert-' + type).attr('role', 'alert').html(messageToUser);
        $('#loginSignup').prepend(alert);
      };
      $('#loginSignupForm').change(function() {
        if ($('input:radio[name=loginSignup]:checked').val() == 'login') {
          $('#loginBox').load('assets/html/login.html', function() {
            $('#loginForm').submit(function() {
              login();
              return false;
            });
          });
        } else{
          $('#loginBox').load('assets/html/signup.html', function() {
            $('#signUpForm').submit(function() {
              signup();
              return false;
            });
          });
        };
      });
      $('#inputlogin').click();
    });
  }
  var signup = function() {
    console.log($('#password').val() === $('#confirmPassword').val());
    if ($('#password').val() === $('#confirmPassword').val()) {
      var user = new Parse.User();
      user.set("username", $('#username').val());
      user.set("password", $('#password').val());
      user.set("email", $('#email').val());
      user.set("fname", $('#fname').val());
      user.set("lname", $('#lname').val());
        
      // other fields can be set just like with Parse.Object
        
      user.signUp(null, {
        success: function(user) {
          // Hooray! Let them use the app now.
          checkUser();
          bootbox.hideAll();
        },
        error: function(user, error) {
          // Show the error message somewhere and let the user try again.
          bootbox.alert("Error: " + error.code + " " + error.message);
        }
      });
    } else{
      bootbox.alert('passwords dont match');
    };

    return false;
  }
  var login = function() {
    var user = $('#username').val();
    var pass = $('#password').val();
    var email = $('#email').val();
      
    Parse.User.logIn(user, pass, {
      success: function(user) {
        // Do stuff after successful login.
        console.log('user: ' + user);
        window.location.href = "./";
        page.reload();
      },
      error: function(user, error) {
        console.log('user: ' + user + ' error: ' + error);
        $('#loginFormOuterDiv').prepend(componants.error('User Name or Password does not match', 'loginError'));
        $('#username').click(function(){componants.removeID('loginError');});
        $('#password').click(function(){componants.removeID('loginError');});
      }
    });
  }
  var logout = function() {
    Parse.User.logOut();
    window.location.href = "./";
  }

  self.account = function() {account();}
  var account = function() {
  	if (Parse.User.current()) {
  		var reviews;
  		async.series([
  			function(callback) {
  				$('#main').load('assets/html/account.html', function() {
  					callback();
  				});
  			},
  			function(callback) {
	      	var reviewQuery = new Parse.Query(Review);
	    		reviewQuery.equalTo('user', Parse.User.current());
	    		reviewQuery.equalTo('state', 1);
	    		reviewQuery.find({
			      success: function(results) {
			      	reviews = results;
			      	callback();
			      },
			      error: function(results, error) {
			        return callback(error);
			      }
			    });
	      },
	      function(callback) {
  				async.forEach(reviews, function(review, callbackForEach) {
	        	makeReviewItem(review, 'yourReviews', false);
			  		callbackForEach();
	        }, function(err) {
	    				if (err) return callback(err);
	    				callback();
	    		});
  			}
  		], function(err) {
  				if(err) return page.error(err);
  		})
  	} else {
  		loginSignupPlain();
  	};
  }

  self.addProduct = function(){addProduct();}
  var addProduct = function() {
    //console.log('add product');
    if (Parse.User.current()) {
      $('#main').load('assets/html/addProduct.html', function() {
        parseObject.categories(function(data) {
          data.forEach(function(row) {
            var option = $('<option>').html(row.get('name')).val(row.id);
            $('#categories').append(option);
          });
        });
        $('#inputPicture').change(function(){
          if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
              $('#imagePreview').attr('src', e.target.result);
            }
            reader.readAsDataURL(this.files[0]);
          }
        });
        $('#addProductForm').submit(function() {
          progress.start(5, 'fileUploadProgressBar');
          submitProduct();
          return false;
        });
      });
    } else{
      loginSignup('Please Sign in to add Products, or <a class="alert-link" href="./">Go to the homepage</a>', 'danger');
    };
  }
  var submitProduct = function() {
    var productItem = new Product();

    $('#addProductForm').find('input').each(function() {
      if(this.id != 'inputPicture' && this.id != 'price') {
        productItem.set(this.id, this.value);
      } else if (this.id == 'price') {
      	productItem.set(this.id, Number(this.value));
      }
    });
    productItem.set('description', $('#description').val());

    var parseFile;
    var pictureName;
    var relation;
    var category;
    async.series([
    	function(callback) {
        var query = new Parse.Query(Category);
		    query.get(($('#categories').val()), {
		      success: function(results) {
		      	category = results;
		        callback();
		      },
		      error: function(results, error) {
		        return callback(error);
		      }
		    });
      },
    	function(callback) {
        productItem.set('category', category);
        productItem.save(null, {
          success: function(productItem) {
            callback();
          }, error: function(productItem, error) {
            return callback(error);
          }
        });
      },
    	function(callback) {
        console.log('New product created with objectId: ' + productItem.id);
        var picture  = $('#inputPicture')[0].files[0];
        if (picture) {
          pictureName = picture.name;
          parseFile = new Parse.File(pictureName, picture, 'image/png');

          parseFile.save().then( 
	          function(parseFile) {
	            callback();
	          }, 
	          function(parseFile, error) {
	            return callback(error);
          });
        } else {
          progress.finish();
          bootbox.alert('Product Saved', allProducts);
          return callback();
        }
      },
      function(callback) {
      	// console.log('New image uploaded with url: ' + parseFile.url());
        console.log(parseFile);

        var imageItem = new ImageObject();
        imageItem.set("product", productItem);
        imageItem.set("image", parseFile);
        imageItem.save(null, {
          success: function(results) {
            console.log('Image saved with ID' + imageItem.id);
            progress.finish();
            bootbox.alert('Product Saved', callback);
          }, error: function(results, error) {
          	return callback(error);
          }
        });
      }
    ], function(err) { 
        if (err) {
        	progress.error();
        	return page.error(err);
        } 
        window.location.href = "./#/product/all";
    });
  }

  self.product = function(item) {product(item);}
  var product = function(item) {
    var html = $('<div>');
    var cat;
    var data;
    var imageData;

    async.series([
      function(callback) {
      	var query = new Parse.Query(Product);
    		query.equalTo('objectId', item);
    		query.include('category');
      	query.find({
		      success: function(results) {
		        data = results[0];
		        callback();
		      },
		      error: function(results, error) {
		        return callback(error);
		      }
		    });
      },
    	function(callback) {
        var imageQuery = new Parse.Query(ImageObject);
        imageQuery.equalTo('product', data);
        imageQuery.find({
          success: function(results) {
            imageData = results[0];
            callback();
          },
          error: function(results, error) {
            return callback(error);
          }
        });
      },
      function(callback) {
        html.load('assets/html/product.html', function() {
	        html.find('#productTitle').html(data.get('name'));
	        html.find('#productDescription').html(data.get('description'));
	        html.find('#productPrice').html('$' + data.get('price'));
	        cat = data.get('category').get('searchName');
	        if(imageData) {
	          html.find('#productImage').attr('src', imageData.get('image').url());
	        }
	       	callback();
	      });
      },
      function(callback) {
	      productPage({html: html, cat: cat, callback: callback});
      },
      function(callback) {
      	html.find('#addReview').load('assets/html/reviewForm.html', function() {
      		var clickCounter = 0;
      		if (Parse.User.current()) {
	      		html.find('#leaveAReviewButton').click(function() {
	      			clickCounter++;
	      			if (!$('#addReview').is(":visible")) {
		      			$('#addReview').slideDown(800);
		      			if (clickCounter == 1) {
			      			$('#star').raty({ 
								    target: '#ratingHintViewer', 
								    hints: ['I hate it', 'I don\'t like it', 'I\'ts okay', 'I like it', 'I love it'],
								    click: function(score) {
								      $('#star').removeClass('ratingPreClick');
								    }
								  });
			      		}
			      		$('#leaveAReviewButton').html('Cancel').removeClass('btn-success').addClass('btn-warning');
							} else {
								$('#addReview').slideUp(800);
								$('#leaveAReviewButton').html('Leave a Review').removeClass('btn-warning').addClass('btn-success');
							}
							$('#submitReviewForm').submit(function() {
								submitReview(data);
								return false;
							});
	      		});
	      	} else{
	      		html.find('#leaveAReviewButton').click(function() {loginSignup('Please sign in to leave a review', 'danger');});
	      	};
	        callback();
	      }).hide();
      }
    ], function(err) { 
        if (err) return page.error(err);
        populateReviews(data);
    });
  }

  self.categories = function(success) {categoriesGet(success);}
  var categoriesGet = function(success) {
    var query = new Parse.Query(Category);
    query.exists("name");
    query.find({
      success: success,
      error: function(data, error) {
        // The object was not retrieved successfully.
        // error is a Parse.Error with an error code and message.
        console.log(error.message);
      }
    });
  }

  self.allProducts = function() {department('all');}
  self.department = function(dept) {department(dept);}
  var department = function(dept) {
    var html = $('<div>');
    var data;
    var categoryMaster;
    var categoryMasterName = 'all';
    async.series([
    	function(callback) {
    		var query = new Parse.Query(Category);
    		query.equalTo('searchName', dept);
    		query.find({
    			success: function(results) {
    				categoryMaster = results[0];
    				callback();
    			},
    			error: function(results, error) {
    				return callback(error);
    			}
    		});
    	},
    	function(callback) {
    		var query = new Parse.Query(Product);
    		if (dept !== 'all') {
    			query.equalTo('category', categoryMaster);
    			categoryMasterName = categoryMaster.get('searchName');
    		}
				query.include('category');
		    query.find({
		      success: function(results) {
		      	data = results;
		        //html.load('assets/html/allProducts.html', function(results) {
		        	callback();
		        //});
		      },
		      error: function(error) {
		        return callback(error);
		      }
		    });
    	},
    	function(callback) {
    		productPage({html: html, cat: categoryMasterName, callback: callback});
    	},
    	function(callback) {
    		var counter = 0;
    		async.forEach(data, function(row, callbackForEach) {
	      	var html2 = $('<div>');
					var imageData;
					var rating = 0;
					var reviews = 0;
			    async.series([
			    	function(callbackInnerSeries) {
			        var imageQuery = new Parse.Query(ImageObject);
			        imageQuery.equalTo('product', row);
			        imageQuery.find({
			          success: function(results) {
			            imageData = results[0];
			            callbackInnerSeries();
			          },
			          error: function(error) {
			            return callbackInnerSeries(error);
			          }
			        });
			      },
			      function(callbackInnerSeries) {
			        html2.load('assets/html/allProductsItem.html', function() {
			          html2.find('#productImageLink').attr('href', './#/product/' + row.id).attr('id', 'productImageLink' + row.id);
			          html2.find('#productTitle').attr('href', './#/product/' + row.id).html(row.get('name')).attr('id', 'productTitle' + row.id);
			          html2.find('#productPrice').html('$' + row.get('price')).attr('id', 'productPrice' + row.id);
			          html2.find('#productDept').attr('href', './#/dept/' + row.get('category').get('searchName')).html(row.get('category').get('searchName')).attr('id', 'productDept' + row.id);
			          if(imageData) {
			            html2.find('#productImage').attr('src', imageData.get('image').url()).html(row.get('name')).attr('id', 'productImage' + row.id);
			          }
			          callbackInnerSeries();
			        });
			      },
			      function(callbackInnerSeries) {
			      	Parse.Cloud.run('averageRating', {productID: row.id}, {
			      		success: function(results){
			      			rating = results.average;
			      			reviews = results.total;
			      			if (rating == 0) reviews = 0;
			      			callbackInnerSeries();
			      		},
			      		error: function(error) {
			      			return callbackInnerSeries(error);
			      		}
			      	});
			      }, 
			      function(callbackInnerSeries) {
			      	//console.log(rating + '/' + reviews);
			      	html2.find('#reviewCount').html(reviews + " review" + ((reviews == 1)? '': 's')).attr('id', 'reviewCount' + row.id);
			      	if (reviews !== 0) {
			      		html2.find('#productRatingText').html((rating + " star" + ((reviews == 1)? '': 's'))).attr('id', 'productRatingText' + row.id);
			      		html2.find('#productRating').raty({readOnly: true, score: function() {
		        			return rating;
		        		}}).attr('id', 'productPrice' + row.id);
			      	};
		          callbackInnerSeries();
			      },
			      function(callbackInnerSeries) {
		          html/*.find('#allProductsRow')*/.append(html2);
		          counter ++;
		          if (counter % 2 == 0) html/*.find('#allProductsRow')*/.append('<div class="clearfix visible-xs"></div>');
		          if (counter % 3 == 0) html/*.find('#allProductsRow')*/.append('<div class="clearfix visible-sm"></div><div class="clearfix visible-md"></div>');
		          if (counter % 4 == 0) html/*.find('#allProductsRow')*/.append('<div class="clearfix visible-lg">');
		          callbackInnerSeries();
			      }
			    ], function(err) { 
			        if (err) return page.error(err);
			        callbackForEach();
			    });
    		}, function(err) {
    				if (err) return page.error(err);
    				callback();
    		});
    	}
    ], function(err) {
    		if (err) return page.error(err);
    });
  }

  self.productPage = function(object) {productPage(object);}
  var productPage = function(object) {
  	async.series([
  		function(callback) {
		    if ($('#productPageMain').length > 0) {
		      $('#productInnerPage').html(object.html);
		      callback();
		    } else {
		      $('#main').load('assets/html/productPage.html', function() {
		      	parseObject.categories(function(data) {
		      		$('#deptList').empty();
		      		$('#deptList').append($('<a>').attr('href', './#/dept/all').html('All Departments').attr('id', 'allDepartment').addClass('list-group-item'));
		      		data.forEach(function(row) {
		      			$('#deptList').append($('<a>').attr('href', './#/dept/' + row.get('searchName')).html(row.get('name')).attr('id', row.get('searchName')+'Department').addClass('list-group-item'));
		      		});
		      		callback();
		      	});
		        $('#productInnerPage').html(object.html);
		      });
		    }
		  }
		], function(err) {
    		if (err) return page.error(err);
    		if (object.cat) {
		    	$('#deptList').find('.active').removeClass('active');
		    	$('#'+object.cat+'Department').addClass('active');
		    }
		    if (object.callback) {
		    	object.callback();
		    };
    }); 
  }

  var populateReviews = function(product) {
  	var reviews;
    var rating = 0;
  	async.series([
      function(callback) {
      	var reviewQuery = new Parse.Query(Review);
    		reviewQuery.equalTo('product', product);
    		reviewQuery.equalTo('state', 1);
    		reviewQuery.include("user");
    		reviewQuery.find({
		      success: function(results) {
		      	reviews = results;
		      	callback();
		      },
		      error: function(results, error) {
		        return callback(error);
		      }
		    });
      },
      function(callback) {
      	if (reviews.length !== 0) {
      		$('#reviewsBox').empty();
      	};
      	if (Parse.User.current()) {
      		var userReviewsObject = Parse.User.current().get('reviewsVotedOn');
	      	var userReviews = [];
	      	for (var i = 0; i < userReviewsObject.length; i++) {
	    			userReviews.push(userReviewsObject[i].id);
	    		};
      	};
      	async.forEach(reviews, function(review, callbackForEach) {
      		var vote = ((userReviews.indexOf(review.id) == -1) && review.get('user').id != Parse.User.current().id);
      		console.log(1);
        	makeReviewItem(review, 'reviewsBox', vote, populateReviews);
        	console.log(2);
		  		rating += review.get('rating');
		  		callbackForEach();
        }, function(err) {
    				if (err) return page.error(err);
    				if (reviews.length !== 0) {
    					$('#productRating').raty({readOnly: true, score: function() {
	        			return (rating / reviews.length);
	        		}});
	        		$('#productRatingText').html(Math.round((rating / ((reviews.length == 0) ? 1 : reviews.length))*100)/100 + ' Stars');
    				};
        		$('#reviewCount').html(reviews.length + ' reviews');
    				callback();
    		});
      }
    ], function(err) { 
        if (err) return page.error(err);
    });
  }
  var makeReviewItem = function(review, parent, vote) {
  	console.log(3);
  	var reviewDom = $('<div>');
  	reviewDom.load('assets/html/reviewItem.html', function() {
  		console.log(4);
  		reviewDom.find('#reviewRating').raty({readOnly: true, score: function() {
  			return review.get('rating');
  		}}).attr('id', 'reviewRating' + review.id);
  		if (review.get('user')) {
  			reviewDom.find('#reviewUser').html(review.get('user').get('fname') + ' ' + review.get('user').get('lname'));
  		} else{
  			reviewDom.find('#reviewUser').html('Anonymous');
  		};
  		reviewDom.find('#reviewUser').attr('id', 'reviewUser' + review.id);
  		var today = new Date(); // Todays date
			var oneDay  = 24*60*60*1000;
			// console.log(Date.parse(review.get('createdAt')));
			var daysAgo =Math.floor(Math.abs((today.getTime() - Date.parse(review.get('createdAt'))) / oneDay));
  		reviewDom.find('#reviewDate').html((daysAgo == 0 ) ? 'Today':(daysAgo + " day" + ((daysAgo == 1) ? '' : '\'s'))).attr('id', 'reviewDate' + review.id);
  		reviewDom.find('#reviewTitle').html(review.get('title')).attr('id', 'reviewTitle' + review.id);
  		reviewDom.find('#reviewText').html(review.get('review')).attr('id', 'reviewText' + review.id);
  		reviewDom.find('#reviewHelpful').html(( review.get('up') ? review.get('up') : 0 ) + ' out of ' + (( review.get('up') ? review.get('up') : 0 ) + ( review.get('down') ? review.get('down') : 0 )) + ' found this review helpful').attr('id', 'reviewHelpful' + review.id);

  		if (vote){
  			reviewDom.find('#reviewHelpfulButtonUp').click(function() {
	  			submitReviewrating(review, 'up');
	  		}).attr('id', 'reviewHelpfulButtonUp' + review.id);
	  		reviewDom.find('#reviewHelpfulButtonDown').click(function() {
	  			submitReviewrating(review, 'down');
	  		}).attr('id', 'reviewHelpfulButtonDown' + review.id);
  		} else {
  			reviewDom.find('#reviewHelpfulButtonUp').remove();
  			reviewDom.find('#reviewHelpfulButtonDown').remove();
  		}

  		if (review.get('user').id == Parse.User.current().id) {
  			reviewDom.find('#deleteReview').click(function() {
  				deleteReview(review);
  				reviewDom.slideUp(500);
	  		}).attr('id', 'deleteReview' + review.id);
	  		reviewDom.find('#editReview').click(function() {
	  			editReview(review, reviewDom);
	  		}).attr('id', 'editReview' + review.id);
  		} else{
  			reviewDom.find('#deleteReview').remove();
	  		reviewDom.find('#editReview').remove();
  		};
  		
  		console.log(5);
  		$('#' + parent).append(reviewDom);
  		console.log(6);
  	});
  }
  var submitReview = function(product) {
  	if (Parse.User.current()) {
	  	var title = $('#titleInput').val();
	  	var rating = $('#star').raty('score');
	  	var review = $('#reviewTextArea').val();
	  	var productReview = new Review();
	  	productReview.set('title', title);
	  	productReview.set('rating', rating);
	  	productReview.set('review', review);
	  	productReview.set('product', product);
	  	productReview.set('state', 1);
	  	productReview.set('user', Parse.User.current());
	  	productReview.save(null, {
	      success: function(productItem) {
	        $('#addReview').html('<h1>Thank you</h1>');
	        $('#addReview').slideUp(1500);
	        populateReviews(product);
	      }, error: function(productItem, error) {
	        return page.error(error);
	      }
	    });
	  } else {
	  	loginSignup('Please sign in to leave a review', 'danger');
	  };
  }
  var submitReviewrating = function(review, up) {
  	if (Parse.User.current()) {
	  	console.log(review);
	  	console.log(up);
	  	console.log(review.get('user'));
	  	var user = Parse.User.current();
	  	if (user.id == review.get('user').id) {
	  		// console.log('same user');
	  	} else{
		  	user.addUnique('reviewsVotedOn', review);
		  	user.save(null, {
		      success: function(user) {
		        // console.log('user Updated');
		        $('#reviewHelpfulButtonUp' + review.id).remove();
        		$('#reviewHelpfulButtonDown' + review.id).remove();
		      }, error: function(user, error) {
		        return page.error(error);
		      }
		    });
		    review.increment(up);
		    review.save(null, {
		      success: function(user) {
		        // console.log('incremented');
		        review.fetch({
		        	success: function(review) {
		        		$('#reviewHelpful' + review.id).html(review.get('up') + ' out of ' + (review.get('up') + review.get('down')) + ' found this review helpful').attr('id', 'reviewHelpful' + review.id);
		        	}
		        })
		      }, error: function(user, error) {
		        return page.error(error);
		      }
		    });
		  };
	  } else {
	  	loginSignup('Please sign in to rate a review', 'warning');
	  };
  }
  var editReview = function(review, domObject) {
  	console.log(review);
  	//console.log(domObject);
  	bootbox.dialog({
      message: '<div id="editReviewBox"></div>',
      title: 'Edit your Review',
    });
    $('#editReviewBox').load('assets/html/editReviewForm.html', function() {
    	$('#editTitleInput').val(review.get('title'));
    	$('#editReviewTextArea').val(review.get('review'));
    	$('#editStar').raty({ 
		    target: '#ratingHintViewer', 
		    hints: ['I hate it', 'I don\'t like it', 'I\'ts okay', 'I like it', 'I love it'],
		    click: function(score) {
		      $('#star').removeClass('ratingPreClick');
		    },
		    score: function() {
		    	return review.get('rating');
		    }
		  });
      $('#editReviewForm').submit(function() {
      	review.set('title', $('#editTitleInput').val());
      	review.set('review', $('#editReviewTextArea').val());
      	review.set('rating', $('#editStar').raty('score'));
      	review.save(null, {
      		success: function(review) {
      			console.log('saved');
      			$('#reviewTitle' + review.id).html(review.get('title'));
			    	$('#reviewText' + review.id).html(review.get('review'));
			    	$('#reviewRating' + review.id).raty({ 
					    score: function() {
					    	return review.get('rating');
					    }
					  });
					  bootbox.hideAll();
      		},
      		error: function(review, error) {
      			page.error(error);
      		}
      	});
        return false;
      });
      $('#cancelEditReview').click(function(){bootbox.hideAll();});
    });
  }
  var deleteReview =  function(review) {
  	console.log(review);
  	review.set('state', -1);
  	review.save();
  }

  return self;
}());

var main = (function() {
  self = {};

  self.load = function() {
  	parseObject.allProducts();
    //load();
  }

  var load = function() {
    var title = $('<h1>').attr('id', 'title').html('Featured Products');
    var p1 = $('<p>').html('Contents ...');
    var p2a = $('<a>').addClass('btn btn-primary btn-lg').html('Learn more');
    var p2 = $('<p>').append(p2a);
    var container = $('<div>').addClass('container').append(title, p1, p2);
    var jumbotron = $('<div>').addClass('jumbotron').append(container);
    $('#main').html(jumbotron);
  }

  return self;
}());

var search = (function() {
  self = {};

  self.searchAll = function(query) {
    search(query);
  }

  var search = function(query) {
    console.log(query);
  }

  return self;
}());

var componants = (function() {
  self = {};

  self.error = function(message, id) {
    var errorIcon = $('<span>').addClass('glyphicon glyphicon-exclamation-sign').attr('aria-hidden', 'true');
    var errorIconSR = $('<span>').addClass('sr-only').html('Error:');
    return $('<div>').append(errorIcon,errorIconSR,message).addClass('alert alert-danger').attr('role', 'alert').attr('id', id);
  }

  self.removeID = function(id) {
    if($('#'+id))
      $('#'+id).remove();
  }

  return self;
}());

var progress = (function() {
  var self = {};
  var interval;
  var timer;
  var item;
  var sr;
  var start;
  var percent;

  self.start = function(givenInterval, id) {
    interval = givenInterval;
    item = $('#' + id);
    sr = $(item.children()[0]);
    start = jQuery.now();
    percent = 0;
    set();
  }

  var set = function() {
    timer = setInterval(function() {
      var now = jQuery.now();
      percent = Math.exp(0.0460517018599 * ((now - start) / interval / 10));
      update(percent);
      if (percent >= 75) {
        clearInterval(timer);
        start = jQuery.now();
        timer = setInterval(function() {
          var now = jQuery.now();
          percent = Math.exp(0.0182321556794 * ((now - start) / interval / 200)) * 75;
          update(percent);
          if (percent >= 90) {
            clearInterval(timer);
            start = jQuery.now();
            timer = setInterval(function() {
              var now = jQuery.now();
              percent = Math.exp(0.00425789041702 * ((now - start) / interval / 200)) * 90;
              update(percent);
              if (percent >= 98) {
                clearInterval(timer);
                start = jQuery.now();
                timer = setInterval(function() {
                  var now = jQuery.now();
                  percent = Math.exp(0.000338412382134 * ((now - start) / interval / 200)) * 98;
                  update(percent);
                  if (percent >= 99) {
                    clearInterval(timer);
                  };
                }, 50);
              };
            }, 50);
          };
        }, 50);
      };
    }, 50);
  }

  self.finish = function() {
    percent = 100;
    clearInterval(timer);
    update(percent);
  }

  self.error = function() {
    self.finish();
    item.addClass('progress-bar-danger').removeClass('active progress-bar-striped');
  }

  var update = function(percent) {
    item.attr('aria-valuenow', percent).css('width', percent + '%');
    sr.html(percent + '% Complete');
  }

  return self;
}());