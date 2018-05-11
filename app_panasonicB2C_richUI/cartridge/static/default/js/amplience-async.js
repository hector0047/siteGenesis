'use strict';

(function() {
	if ( !window.amp ) {
		window.amp = {loaded: false}
	}

	window.amp.asyncLoad = function( deps ) {
		amp.attachEvent(window, 'load', function() {
			var scriptsLoaded = 0;
			
			for ( var i in deps ) {
				if (deps.hasOwnProperty(i)) {					
					var el = document.createElement('script');
					el.src = deps[i];
					el.async = false;

					document.body.appendChild(el);
					amp.attachEvent(el, 'load', function() {
						var loaded = (++scriptsLoaded == deps.length);
						
						if ( loaded && typeof amp.dwInit == 'function' ) {
							amp.dwInit.call(amp);
							amp.dwInit = null;
						} else if ( loaded ) {
							amp.loaded = true;
						}
					});
				}
			}
			
		});
	};

	window.amp.attachEvent = function( el, ev, fn ) {
		if ( ev === 'load' ) {
			if ( el === window && document.readyState === 'complete' ) {
				fn();
			} else if ( el === window && document.readyState !== 'complete' && window.attachEvent ) {
				ev = 'readystatechange';
				el = document;
			}
		}

		if ( window.addEventListener ) {
			el.addEventListener( ev, fn, false );
		} else if ( window.attachEvent ) {
			el.attachEvent('on' + ev, fn);
		} else {
			el[ 'on' + ev ] = fn;
		}

		el = null;
	};
}());
