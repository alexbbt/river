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
	} else {
		console.log('main');
		main.load();
	}

	$('#searchForm').submit(function() {
		window.location.href = "./#/search/" + $('#search').val();
		return false;
	})
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
			var span = $('<span>').addClass('glyphicon glyphicon-user').attr('aria-hidden',"true");
			var a = $('<a>').append(span).append(' Login').addClass('btn').click(loginSignup);
			$('#loginField').html(a);
		} else{
			console.log('user not null');
		};
	}

	var loginSignup = function() {
		var login = '<form role="login">' +
				'	<legend>Login</legend>' +
				'	<div class="form-group">' +
				'		<label for="">User Name: </label>' +
				'		<input type="text" class="form-control" id="user" placeholder="email or user name">' +
				'	</div>' +
				'	<div class="form-group">' +
				'		<label for="">Password: </label>' +
				'		<input type="password" class="form-control" id="password" placeholder="password">' +
				'	</div>' +
				'	<button type="submit" class="btn btn-primary">Login</button>' +
				'</form>';
		var signUp = '<form role="login" id="signUpForm">' +
				'	<legend>Sign Up</legend>' +
				'	<div class="form-group">' +
				' 	<label for="">User Name: </label>' +
				'	  <input type="text" class="form-control" id="userName" placeholder="user name">' +
				'	</div>' +
				'	<div class="form-group">' +
				' 	<label for="">Email: </label>' +
				'	  <input type="text" class="form-control" id="email" placeholder="email">' +
				'	</div>' +
				' <div class="form-group">' +
				'  <label for="">Password: </label>' +
				'  <input type="password" class="form-control" id="password" placeholder="password">' +
				' </div>' +
				'	<div class="form-group">' +
				' 	<label for="">Confirm Password: </label>' +
				'  <input type="password" class="form-control" id="confirmPassword" placeholder="password">' +
				'	</div>' +
				'	<button type="submit" class="btn btn-primary">Sign Up</button>' +
				'</form>';
		var initial = '<div class="radio radio-inline" id="loginSignupForm">' +
	      '  <label>' +
	      '    <input type="radio" name="loginSignup" id="inputlogin" value="login" checked="checked">' +
	      '    Login' +
	      '  </label>' +
	      '  <label>' +
	      '    <input type="radio" name="loginSignup" id="inputSignup" value="signup">' +
	      '    Signup' +
	      '  </label>' +
	      '</div>' +
	      '<hr>' +
	      '<div id="loginBox">' +
	      login +
	      '</div>';
		bootbox.dialog({
		  message: initial,
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
		$('#loginSignupForm').change(function() {
			console.log('change');
			console.log($('input:radio[name=loginSignup]:checked').val());
			if ($('input:radio[name=loginSignup]:checked').val() == 'login') {
				$('#loginBox').html(login);
			} else{
				$('#loginBox').html(signUp);
				$('#signUpForm').submit(function() {
					signup();
					return false;
				});
			};
			

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
			user.set("username", $('#userName').val());
			user.set("password", $('#password').val());
			user.set("email", $('#email').val());
			  
			// other fields can be set just like with Parse.Object
			  
			user.signUp(null, {
			  success: function(user) {
			    // Hooray! Let them use the app now.
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

	return self;
}());

var main = (function() {
	self = {};

	self.load = function() {
		load();
	}

	var load = function() {
		var title = React.createElement('h1', { id: 'title', key:1 }, 'Featured Products');
		var p1 = React.createElement('p', {key:2}, 'Contents ...');
		var p2a = React.createElement('a', { className: 'btn btn-primary btn-lg' }, 'Learn more');
		var p2 = React.createElement('p', {key:3}, p2a);
		var container = React.createElement('div', { className: 'container' },[title, p1, p2]);
		var jumbotron = React.createElement('div', { className: 'jumbotron' }, container);
		ReactDOM.render(jumbotron, document.getElementById('main'));
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

	self.container = function(query) {
		search(query);
	}

	return self;
}());

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}