//------------------------------------------------------------------------------------------
// common functions
//------------------------------------------------------------------------------------------

// function to wait and execute the filter
// Usage: 
//$('#yourinput').keyup(function() {
//		  delay(function(){
//		    callyour function();
//		  }, 1000 );
//		});

var delay = (function(){
	  var timer = 0;
	  return function(callback, ms){
	  clearTimeout (timer);
	  timer = setTimeout(callback, ms);
	 };
	})();


function urlParam(name){
	
	  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	  if (results!=undefined){
		  return results[1] || 0;
	}
	return "";
}

