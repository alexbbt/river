$(document).ready(function() {
	set();
	$(window).bind( 'hashchange', function(e) {
		set();
	});
});
var set = function() {
	var item = window.location.hash.substr(1).split('/')[1];
	$('#main').load('assets/html/'+item+'.html', function(){
		console.log($('#main').children().hasClass('container'));
		if ($('#main').children().hasClass('container')) {
			$('#main').children().removeClass('container');
		};
	});
}