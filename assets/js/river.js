$(document).ready(function() {
	parseObject.initialize();
	var query = window.location.hash.substr(1);
	console.log('query: ' + query);
	var page = query.split('/')[1];
	var item = query.split('/')[2];
	console.log('page: ' + page);
	if (page == 'search') {
		console.log('search');
		search.searchAll(item);
	} else if (page == 'product') {
		console.log('product');
		if (item == 'add') {
			parseObject.addProduct();
		} else if (item == 'all') {
			parseObject.allProducts();
		} else {
			parseObject.product(item);
		}
	} else {
		console.log('main');
		main.load();
	}

	$('#searchForm').submit(function() {
		window.location.href = "./#/search/" + $('#search').val();
		return true;
	});
	$(window).bind( 'hashchange', function(e) {location.reload(); });

});

var parseObject = (function () {
	var self = {};

	var Product;
	var Category;
	var ImageObject;

	self.initialize = function() {
		initialize();
	}

	var initialize = function() {
		Parse.initialize("0kAbqraYuEVB2Wr8ZihnGtmASPId34SJyzFkHyEo", "a6rw0cA6myWnM3SZ7PfH0LiyUibcXatTlhcYB91f");
		Product = Parse.Object.extend('Product');
		Category = Parse.Object.extend('Category');
		ImageObject = Parse.Object.extend('Image');
		checkUser();
	}

	var checkUser = function() {
		console.log(Parse.User.current());
		if (Parse.User.current() == null) {
			console.log('null user');
			var loginIcon = $('<span>').addClass('glyphicon glyphicon-log-in').attr('aria-hidden',"true");
			var a = $('<a>').append(loginIcon).append(' Login').addClass('btn').click(loginSignupPlain);
			$('#loginField').html(a);
		} else{
			console.log('user not null');
			console.log(Parse.User.current());
			var userIcon = $('<span>').addClass('glyphicon glyphicon-user').attr('aria-hidden',"true");
			if (!Parse.User.current().get('fname')) {
				var name = Parse.User.current().get('username');
				} else{
				var name = Parse.User.current().get('fname')+' '+Parse.User.current().get('lname');
			};
			var caret = $('<b>').addClass('caret');
			var account = $('<a>').append(userIcon).append(' '+name).append(caret).addClass('dropdown-toggle').attr('data-toggle','dropdown').click(function() {
				window.location.href = "./#/myaccount/";
			});

			var orders = $('<a>').append('Orders').addClass('dropdown-toggle').click(function() {
				window.location.href = "./#/orders/";
			});
			var ordersli = $('<li>').append(orders);

			var divider = $('<li>').addClass('divider');

			var logoutIcon = $('<span>').addClass('glyphicon glyphicon-log-out').attr('aria-hidden',"true");
			var logoutButton = $('<a>').append(logoutIcon).append(' Logout').addClass('dropdown-toggle');
			var logoutli = $('<li>').append(logoutButton).click(logout);
			
			var dropdown = $('<ul>').addClass('dropdown-menu').attr('id','myAccountDropdown').append(ordersli, divider, logoutli);
			$('#loginField').html(account).append(dropdown).addClass('dropdown');
		};
	}
	var loginSignupPlain = function() {loginSignup('','');}
	var loginSignup = function(messageToUser, type) {
		bootbox.dialog({
		  message: '</div><div id="loginSignup"></div>',
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
			console.log(type);
			if (messageToUser != '') {
				var alert = $('<div>').addClass('alert alert-' + type).attr('role', 'alert').html(messageToUser);
				$('#loginSignup').prepend(alert);
			};
		  $('#loginBox').load('assets/html/login.html', function() {
		  	$('#loginForm').submit(function() {
					login();
					return false;
				});
		  });
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
		    location.reload();
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

	self.addProduct = function(){addProduct();}
	var addProduct = function() {
		console.log('add product');
		if (Parse.User.current()) {
			$('#main').load('assets/html/addProduct.html', function() {
				parseObject.categories();
				$('#inputPicture').change(function(){
					if (this.files && this.files[0]) {
		        var reader = new FileReader();
		        reader.onload = function (e) {
		         	$('#imagePreview').attr('src', e.target.result);
		        }
		        reader.readAsDataURL(this.files[0]);
		  	  }
				});
				console.log('add new loaded');
				$('#addProductForm').submit(function() {
					progress.start(5, 'fileUploadProgressBar');
					addProductP2();
					return false;
				});
			});
		} else{
			loginSignup('Please Sign in to add Products, or <a class="alert-link" href="./">Go to the homepage</a>', 'danger');
		};
	}

	var addProductP2 = function() {
		var productItem = new Product();

		$('#addProductForm').find('input').each(function() {
			if(this.id != 'inputPicture' && this.id != 'categories') {
				productItem.set(this.id, this.value);
			}
		});

		var query = new Parse.Query(Category);
		query.get(($('#categories').val()), {
		  success: function(category) {
		  	var relation = productItem.relation('categories');
		  	relation.add(category);
		    productItem.save(null, {
					success: function(productItem) {
						console.log('New product created with objectId: ' + productItem.id);
						var picture  = $('#inputPicture')[0].files[0];
						if (picture) {
							var name = picture.name;
							var parseFile = new Parse.File(name, picture, 'image/png');

							parseFile.save().then( 

							function(parseFile) {
								console.log('New image uploaded with url: ' + parseFile.url());
								console.log(parseFile);

								var imageItem = new ImageObject();
								imageItem.set("product", productItem);
								imageItem.set("image", parseFile);

								imageItem.save(null, {
									success: function(imageItem) {
										console.log('Image saved with ID' + imageItem.id);
										progress.finish();
										bootbox.alert('Product Saved', allProducts);
									}, error: function(imageItem, error) {
										progress.error();
										console.log("error assosiating image: " + error.message);
										console.log(error);
									}
								});

							}, 
							function(parseFile, error) {
								progress.error();
								console.log("error saving image: " + error.message);
							});
						} else {
							progress.finish();
							bootbox.alert('Product Saved', allProducts);
						}
					}, error: function(productItem, error) {
						progress.error();
						console.log('error saving product: ' + error.message);
					}
				});
		  },
		  error: function(object, error) {
		  	progress.error();
		    console.log(error.message);
		  }
		});
	}

	self.product = function(item) {
		product(item);
	}

	var product = function(item) {
		var query = new Parse.Query(Product);
		query.equalTo('objectId', item);
		query.find({
			success: function(data) {
				data = data[0];
				var imageQuery = new Parse.Query(ImageObject);
				imageQuery.equalTo('product', data);
				imageQuery.find({
					success: function(imageData) {
						imageData = imageData[0];
						$('#main').load('assets/html/product.html', function() {
							$('#productTitle').html(data.get('name'));
							$('#productDescription').html(data.get('description'));
							if(imageData) {
								$('#productImage').attr('src', imageData.get('image').url());
							}
						});
					},
					error: function(imageData, error) {
						console.log('Error loading Product Image: ' + error.message);
					}
				});
			},
			error: function(data, error) {
				console.log('Error loading Product: ' + error.message);
			}
		});
	}

	self.categories = function() {
		categoriesGet();
	}

	var categoriesGet = function() {
		var query = new Parse.Query(Category);
		query.exists("name");
		query.find({
		  success: function(data) {
		    // The object was retrieved successfully.
				data.forEach(function(row) {
					console.log(row.get('name'));
					var option = $('<option>').html(row.get('name')).val(row.id);
					$('#categories').append(option);
				})
		  },
		  error: function(data, error) {
		    // The object was not retrieved successfully.
		    // error is a Parse.Error with an error code and message.
		    console.log(error.message);
		  }
		});
	}

	self.allProducts = function() {
		allProducts();
	}

	var allProducts = function() {
		console.log('allProducts');
		var query = new Parse.Query(Product);
		query.exists('objectId');
		query.find({
			success: function(data) {
				$('#main').load('assets/html/allProducts.html', function() {
					data.forEach(function(row) {
						var imageQuery = new Parse.Query(ImageObject);
						imageQuery.equalTo('product', row);
						imageQuery.find({
							success: function(imageData) {
								imageData = imageData[0];
								var relation = row.relation('categories');
								var catQuery = relation.query();
								catQuery.find({
									success: function(cats) {
										var link = $('<a>').attr('src', '#/product/' + row.id).html('visit product page').addClass('btn btn-default').click(function() {
											window.location.href = "./#/product/"+ row.id;
										});
										var description = $('<p>').html(row.get('description'));
										var title = $('<h3>').html(row.get('name'));
										var box = $('<div>').addClass('productBox');
										var catList = $('<ul>');
										cats.forEach(function(cat) {
											catList.append($('<li>').html(cat.get('name')));
										});
										if(imageData) {
											var img = $('<img>').addClass('img-responsive').attr('src', imageData.get('image').url());
											box.append(img);
										}
										box.append(title, description, catList, link);
										var outerBox = $('<div>').addClass('outerProductBox col-xs-12 col-sm-6 col-md-4 col-lg-3').append(box);
										$('#allProductsRow').append(outerBox);

									}, error: function(modal, error) {
										console.log('Error loading Product Categories: ' + error.message);
									}
								})
							},
							error: function(imageData, error) {
								console.log('Error loading Product Image: ' + error.message);
							}
						});
					});
				});
			},
			error: function(data, error) {
				console.log('Error loading Product: ' + error.message);
			}
		});
	}

	return self;
}());

var main = (function() {
	self = {};

	self.load = function() {
		load();
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

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}