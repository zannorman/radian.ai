var statsOn = false;

if (statsOn){
	// Init Stats
	var stats = new Stats();
	stats.setMode(0);
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	document.body.appendChild(stats.domElement);
}

/*!
 * Mantis.js / jQuery / Zepto.js plugin for Constellation
 * @version 1.2.2
 * @author Acauã Montiel <contato@acauamontiel.com.br>
 * @license http://acaua.mit-license.org/
 */
(function ($, window) {
	var $window = $(window);
	/**
	 * Makes a nice constellation on canvas
	 * @constructor Constellation
	 */
	function Constellation (canvas, options) {
		var $canvas = $(canvas),
			context = canvas.getContext('2d'),
			defaults = {
				star: {
					color: 'rgba(255, 255, 255, .5)',
					width: 1,
					randomWidth: true
				},
				line: {
					color: 'rgba(255, 255, 255, .5)',
					width: 0.3
				},
				position: {
					x: 0,
					y: 0
				},
				width: window.innerWidth,
				height: window.innerHeight,
				velocity: 0.25,
				length: 100,
				distance: 120,
				radius: 150,
				stars: []
			},
			config = $.extend(true, {}, defaults, options);

		function Star () {
			this.x = Math.random() * canvas.width;
			this.y = Math.random() * canvas.height;

			this.vx = (config.velocity * (Math.random() - 0.5));
			this.vy = (config.velocity * (Math.random() - 0.5));
			this.lineLife = 0;
			this.radius = config.star.randomWidth ? (Math.random() * config.star.width) : config.star.width;
		}

		Star.prototype = {
			create: function(){
				context.beginPath();
				context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
				context.fill();
			},

			animate: function(){
				var i;
				for (i = 0; i < config.length; i++) {

					var star = config.stars[i];

					if (star.y < 0 || star.y > canvas.height) {
						star.vx = star.vx;
						star.vy = - star.vy;
					} else if (star.x < 0 || star.x > canvas.width) {
						star.vx = - star.vx;
						star.vy = star.vy;
					}

					star.x += star.vx;
					star.y += star.vy;
				}
			},
			line: function(){
				var length = config.length,
					iStar,
					jStar,
					i,
					j;

				for (i = 0; i < length; i++) {
					
					for (j = 0; j < length; j++) {
						
						iStar = config.stars[i];
						jStar = config.stars[j];
						starDist = Math.abs(iStar.x-jStar.x) + Math.abs(iStar.y-jStar.y);
						brightness = (200 - starDist)/120;
						if (brightness > .5) brightness = Math.min(1,brightness+0.25);
//						starDist = Math.sqrt(Math.pow(Math.abs(iStar.x-jStar.x),2) + Math.pow(Math.abs(iStar.y-jStar.y)));
						// at distances between 0 and config distance, brightness is 1
						// at config * 1.5 dist brightness is zero
						if (	true
//							(iStar.x - jStar.x) < config.distance &&
//							(iStar.y - jStar.y) < config.distance &&
//							(iStar.x - jStar.x) > - config.distance &&
//							(iStar.y - jStar.y) > - config.distance
						) {
							if (
								(iStar.x - config.position.x) < config.radius &&
								(iStar.y - config.position.y) < config.radius &&
								(iStar.x - config.position.x) > - config.radius &&
								(iStar.y - config.position.y) > - config.radius
							) {
								config.stars[i].lineLife = Math.min(0.5, config.stars[i].lineLife + .0003);
							} else {
								config.stars[i].lineLife = Math.max(0, config.stars[i].lineLife - .00005);
						
							}

							if (brightness > .1 && (iStar.lineLife > .01 || jStar.lineLife > .01)) {
								context.beginPath();
								context.moveTo(iStar.x, iStar.y);
								context.lineTo(jStar.x, jStar.y);
								context.strokeStyle = getColor(iStar,jStar,brightness);
								// getRandomColor(); // color cycle based on global x,y, HSV cycle over time
								context.stroke();
								context.closePath();
							}
					
						}
					}
				}
			}
		};

		this.createStars = function () {
			var length = config.length,
				star,
				i;

			context.clearRect(0, 0, canvas.width, canvas.height);

			for (i = 0; i < length; i++) {
				config.stars.push(new Star());
				star = config.stars[i];

				star.create();
			}

			star.line();
			star.animate();
		};

		this.setCanvas = function () {
			canvas.width = config.width;
			canvas.height = config.height;
		};

		this.setContext = function () {
			context.fillStyle = config.star.color;
			context.strokeStyle = config.line.color;
			context.lineWidth = config.line.width;
		};

		this.setInitialPosition = function () {
			if (!options || !options.hasOwnProperty('position')) {
				config.position = {
					x: canvas.width * 0.5,
					y: canvas.height * 0.5
				};
			}
		};

		this.loop = function (callback) {
			callback();

			this.rAF = window.requestAnimationFrame(function () {
				if (statsOn) stats.begin();
				this.loop(callback);
				if (statsOn) stats.end();
			}.bind(this));
		};

		this.handlers = {
			window: {
				mousemove: function(e){
					config.position.x = e.pageX - $canvas.offset().left;
					config.position.y = e.pageY - $canvas.offset().top;
				},
				resize: function () {
					window.cancelAnimationFrame(this.rAF);
				}
			}
		};

		this.bind = function () {
			$window
				.on('mousemove', this.handlers.window.mousemove)
				.on('resize', this.handlers.window.resize.bind(this));
		};

		this.unbind = function () {
			$window
				.off('mousemove', this.handlers.window.mousemove)
				.off('resize', this.handlers.window.resize);
		}

		this.init = function () {
			this.setCanvas();
			this.setContext();
			this.setInitialPosition();
			this.loop(this.createStars);
			this.bind();
		};
	}

	function instantiate(element, options) {
		var c = new Constellation(element, options);
		c.init();
	}

	$.fn.constellation = function (options) {
		return this.each(function () {
			$window.on('resize', () => {
				instantiate(this, options);
			});

			instantiate(this, options);
		});
	};
})($, window);

// Init plugin
$('canvas').constellation({
	star: {
		width: 3
	},
	line: {
		color: 'rgba(255, 255, 255, .5)'
	},
	length: (window.innerWidth / 6),
	radius: (window.innerWidth / 6)
});

var offset = 0;
var iterOffsetIncrement = .0008; // a higher value makes more rainbows faster
var xyDiff = 0.5;
var w = $('canvas').width();
var h = $('canvas').height();
function getColor(iStar, jStar,brightness){
//	console.log('ll:'+iStar.lineLife);
	offset += iterOffsetIncrement;
	offset %= 255;
	x = (iStar.x+jStar.x)/2;
	y = (iStar.y+jStar.y)/2;
	
	xC = x / w; // 0 to 1
	yC = y / h; // 0 to 1

	xH = xC * 255 ; // 0 to 255
	yH = yC * 255; // 0 to 255

	// Apply (a shifting) offset to x and y
	hue = parseInt(((xH + offset) + (yH + offset * xyDiff)) % 1000);

	ll = parseInt((iStar.lineLife) * 100 * brightness) + "%";
//	console.log("hue:"+hue);	
	return "hsl("+hue+",50%,"+ll+")";
	

	// rainbow across entire screen...
//	console.log("x,y: "+x+", "+y+", cavn:"+$('canvas').width());
		
}


