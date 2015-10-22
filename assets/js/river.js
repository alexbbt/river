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
			product.add();
		} else{
			product.find(item);
		};
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

	var Products;

	self.initialize = function() {
		initialize();
	}

	var initialize = function() {
		Parse.initialize("0kAbqraYuEVB2Wr8ZihnGtmASPId34SJyzFkHyEo", "a6rw0cA6myWnM3SZ7PfH0LiyUibcXatTlhcYB91f");
		Products = Parse.Object.extend('Products');
		checkUser();
	}

	var checkUser = function() {
		console.log(Parse.User.current());
		if (Parse.User.current() == null) {
			console.log('null user');
			var loginIcon = $('<span>').addClass('glyphicon glyphicon-log-in').attr('aria-hidden',"true");
			var a = $('<a>').append(loginIcon).append(' Login').addClass('btn').click(loginSignup);
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

	var loginSignup = function() {
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
		    danger: {
		      label: "Danger!",
		      className: "btn-danger",
		      callback: function() {
		        console.log("uh oh, look out!");
		      }
		    },
		  }
		});
		$('#loginSignup').load('assets/html/loginSignup.html', function() {
		  $('#loginBox').load('assets/html/login.html', function() {
		  	$('#loginForm').submit(function() {
					login();
					return false;
				});
		  });
		  $('#loginSignupForm').change(function() {
				//console.log('change');
				//console.log($('input:radio[name=loginSignup]:checked').val());
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

	var test = function() {
		var TestObject = Parse.Object.extend("TestObject");
		var testObject = new TestObject();
		testObject.save({foo: "bar"}).then(function(object) {
		  alert("yay! it worked");
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
			    alert("Error: " + error.code + " " + error.message);
			  }
			});
		} else{
			alert('passwords dont match');
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

var product = (function() {
	self = {};

	self.add = function() {
		add();
	}

	var add = function() {
		console.log('add product');
		$('#main').load('assets/html/addProduct.html', function() {
			console.log('add new loaded');
			$('#addProductForm').submit(function() {
				var picture  = $('#inputPicture').val();
				console.log(picture);
				return false;
			});
		});
	}

	self.find = function(item) {
		find(item);
	}

	var find = function(item) {
		console.log(item);
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

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}