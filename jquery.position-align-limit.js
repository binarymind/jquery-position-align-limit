/*
 * Magic jQuery JavaScript Library v1.3.4 : Position - Limit _ Align part
 * http://jquery-css.com/
 *
 * Copyright 2011, Bastien LIUTKUS from Binary Mind
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 * NEEDED
 * - resize plugin : http://github.com/cowboy/jquery-resize/raw/v1.1/jquery.ba-resize.min.js
*/

/*******************************************************
* 
* CORE : DEFINE THE VARS
* 
*******************************************************/
jQuery.magic= {
	/** fastest access to window */
	w:$(window),
	//used to generate unique id on get selector function
	UIDIncrement : 0,
	/** used to lock critical functions */
	locked : {createReal:false}, 			
	/** Array containing for each element its associated real'selector */
	reals : new Array,
	/** Array containing for each real its associated original'selector */
	fakes : new Array,
	/** the jQuery element containing all the reals */
	realContainer : null,			
	/** fast acces browser information */			
	browser : {
		iStuff : (navigator.platform == 'iPad' || navigator.platform == 'iPhone' || navigator.platform == 'iPod') ? true:false,
		mobile :  /mobile/i.test(navigator.userAgent),
		/** is the browser accepting fixed property in css */
		fixedSupport : !(($.browser.msie && ($.browser.version=="6.0" || (/mobile/i.test(navigator.userAgent) && parseInt($.browser.version, 10)<=7)))|| (typeof $.browser.webkit != 'undefined' && parseInt($.browser.version, 10)<534) || ((navigator.platform == 'iPad' || navigator.platform == 'iPhone' || navigator.platform == 'iPod') && parseInt($.browser.version, 10)<534))
	}, 
	/** may be usefull */
	staticClass:"fixed",
	/** usefull list functions */
	tools : {
		areHashEqual : function (array1, array2) {
			for (var i in array1) {
				if(array2[i] ==array1[i] ) {continue;}
				if(array2[i] == undefined  || (typeof array2[i] != "object" && array1[i] != array2[i]) || (typeof array2[i] == "object" && typeof array1[i] == "object" && !$.magic.tools.areHashEqual(array2[i], array1[i]))) {return false;}
			}
			return true;
		}, 
		/**
		 * remove duplicates elements in an array
		 */
		removeDuplicates : function (a) {
		   var r = new Array;
		   o:for(var i = 0, n = a.length; i < n; i++) {
		      for(var x = 0, y = r.length; x < y; x++){ 
		      	if(r[x]==a[i]) {continue o;}
		      	if(typeof r[x] == "object" && typeof a[i] == "object" && $.magic.tools.areHashEqual(r[x], a[i])) {continue o;};
		      }
		      r[r.length] = a[i];
		   }
		   return r;
		},
		/**
		 * remove an element in an array
		 */
		removeItems : function (originalArray, itemsToRemove) {
			if(!originalArray || !itemsToRemove) {return originalArray;}
			var j;
			for (var i = 0; i < itemsToRemove.length; i++) {
				j = 0;
				while (j < originalArray.length) {
					if (originalArray[j] == itemsToRemove[i] || (typeof originalArray[j] =="object" && typeof itemsToRemove[i] == "object" &&  $.magic.tools.areHashEqual(originalArray[j], itemsToRemove[i]))) { originalArray.splice(j, 1);} 
					else {j++;}
				}
			}
			return originalArray;
		}
	}, 
	isSelector : function(options) {
		return typeof options == "string" || $.isWindow(options)
	},
	/** tool to have quick acces to direction proccess  */
	coord : {
		/************** private data **************/
		dir : {
			top:-1,					/* VERTICAL   % 2  != 0 */
			right:2, 				/* HORIZONTAL % 2  =  0 */
			bottom:1, 				/* direction = - opositeDirection */
			left:-2 				/* infDirection < 0	  &  supDirecton > 0 (ex : top < 0 & bottom>0)	*/ 
		},
		/** Array used to cache the coordinates values */
		cache : new Array, clearCache : function(x) {$.magic.coord.cache = new Array},
		/************** coordinates functions **************/
		/** return the position value with those align/limit parameters */ 
		getValue:function(options){
			//options = {me, side, my, at, offset, other}
			var toReturn =  
				/* my ratio */
				((options.my !=0 && options.my !=undefined) ? -$.magic.coord.distanceToOpposite(options.me, options.side)*options.my:0)	
				/* at ratio */
				+ ((options.at !=0 && options.at !=undefined) ? $.magic.coord.distanceToOpposite(options.other, options.side)*options.at:0)	
				/*coordinates */
				+options.other.coordinates(options.side);
			
			if(options.offset!=undefined) {
				toReturn += $.magic.coord.isMaxValue(options.side) ? -options.offset : options.offset;
			}
			return toReturn;
		},
		cleanOptions:function(newOptions, oldOptions){
			//options = 1 only parameter
			if ($.magic.isSelector(newOptions)) {
				newOptions = {
					top: {my:0,at:0,selector:newOptions, offset:0},  
					right: {my:0,at:0,selector:newOptions, offset:0},  
					bottom: {my:0,at:0,selector:newOptions, offset:0},  
					left: {my:0,at:0,selector:newOptions, offset:0}
				};  
				var defaults = {top: null, right: null, bottom: null, left: null, manual:true}; 
				newOptions =  $.extend(new Object, defaults, newOptions); 	
				return newOptions;
			} else {
				var tempOptions = oldOptions !=null ? oldOptions : {top: null, right: null, bottom: null, left: null, manual:true}; 
				//for each side of options : get the new value and if none, the old value
				for (x in tempOptions) {
					if(newOptions[x]!=null && newOptions[x]!=undefined) { 
						//if new value : clean this value
						if ($.magic.isSelector(newOptions[x])) {
							newOptions[x]={my:0, at:0,selector:newOptions[x]};	
						} else if($.magic.coord.isDirection(x)){
							newOptions[x] = $.extend({my:0, at:0, offset:0, selector:null}, newOptions[x]);
						}
					} else {
						newOptions[x] = tempOptions[x];
					}
				}
			}
			return newOptions;	
		},
		/** return if true/false the given parameter is a direction */
		isDirection : function(x) {return (this.dir[x]!=undefined);},
		/** return if true/false the directionis vertical */
		isVertical : function(x) {return (this.dir[x]==0 || (this.dir[x] % 2 != 0));},
		/** return if true/false the directionis horizontal */
		isHorizontal : function(x) {return (this.dir[x] % 2 == 0);},
		/** return if true/false the direction given is max value (ex bottom => true, top => false) */
		isMaxValue : function (x) {if (this.dir[x]>0) {return true;} else {return false;}},
		/** return the distance to the opposite starting direction for the given element */
		distanceToOpposite : function (element, x) {
			var coordinates = element.coordinates();
			if(this.isVertical(x)){if(this.dir[x]<0) {return coordinates.height;} else {if(this.dir[x]==0){return 0;} else {return - coordinates.height;}}}
			else {if(this.dir[x]<0) {return coordinates.width;} else {return - coordinates.width;}}
		},
		/** return the distance name for this direction */
		distanceNameForThisDirection : function (x) {
			if(this.isVertical(x)){return "height";} else {return "width";}
		},
		/** return the opposite direction */
		opposite : function (x) {for(var y in this.dir) { if (this.dir[x] == - this.dir[y]) {return y;}}return null;}
	}, 
	/** apply the desired position, empty position cache */
	applyPosition : function (target, targetId, options) {delete $.magic.coord.cache[targetId];target.css(options);}, 
	/** apply the desired position, empty position cache */
	applyUserChanges : function (target, targetId, options) {$.magic.applyPosition(target, targetId, options);}, 
	/** init function for the plugin */
	init : function() {
		/* mobile special behaviours */
		if(this.browser.mobile) {
			this.defaultAction = "click";
		}
		/* add the needed CSS */
		var myBody = $('body');
		myBody.prepend('<style>'
			+"\n"+'.fixed {position:fixed !important;top:0;left:0;}'
			+"\n"+'.static , .absolute {position:absolute;top:0;left:0;}'
			+"\n"+'.relative {position:relative !important;}'
			+"\n"+'.invisible {visibility:hidden !important}'
			+"\n"+'.tNoSelect {-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-o-user-select: none;user-select: none;}'
			+"\n"+'*+html * , *+div{zoom:1;}'
			+"\n"+'</style>');
		/** function to apply css orders (the options will contains 'center' property to explode into correct left/right */
		$.magic.w.bind('scroll', $.magic.coord.clearCache);
		$.magic.w.bind('resize',  $.magic.coord.clearCache);
		//Create real container	
		myBody.append('<div class="absolute" style="z-index:10000000;width:100%;height:0;" id="realContainerWrapper"><div id="realContainer" class="relative" style="width:100%; margin:0; padding:0;text-align:left;"></div></div>');
		$.magic.realContainer = $("#realContainer");
	}
};

/** do init the plugin */
$(document).ready(function () {$.magic.init();});

/*******************************************************
* 
* CORE : SELECTOR FUNCTIONS
* 
*******************************************************/
(function($) {
		/**
		    because we can't do $.magic.w.is(':visible')   on ie
		    @return bool of visible
		*/	
        $.fn.isVisible = function(){
			if($.browser.msie && $.isWindow($(this)[0])) {return $('html').is(':visible');}
			else {return $(this).is(':visible');}
		};
		$.fn.transfertEvent = function(e){$(this).getFake().trigger(e);};
		/**
		    get the selector of the element
		    @return a string which is the id of the element
		*/	
        $.fn.getSelector = function(){
			var me=$(this);
			if(!$.isWindow(me[0])){	
				var toReturn = me.attr('id'); if(!toReturn){toReturn = "me-" + $.magic.UIDIncrement; $.magic.UIDIncrement++;me.attr('id', toReturn);}
				me=null;
				return '#'+toReturn;
			} else {me=null;return window;} //this is the window
		};
		/**
		    get the selector of the original element
		    @name getNotNullId
		    @function
		    @return a string which is the id of the element
		*/	
        $.fn.getFakeSelector = function(){
			var mySelector = $(this).getSelector();
			if($.magic.fakes[mySelector]) {
				return $.magic.fakes[mySelector];
			} else {
				return mySelector;
			}
		};
		/**
		    get the selector of the real element, if no real return my selector
		    @name getNotNullId
		    @function
		    @return a string which is the id of the element
		*/	
        $.fn.getRealSelector = function(){
			var mySelector = $(this).getSelector();
			if($.magic.reals[mySelector]) {
				return $.magic.reals[mySelector];
			} else {
				return mySelector;
			}
		};
		/**
		    tell if the matched element is a real
		*/	
        $.fn.isReal = function(){
			return $(this).hasClass("real"); 
		};
		/**
		    return the real of this element
		*/	
        $.fn.getReal = function(){
			return $($(this).getRealSelector()); 
		};
		/**
		    return the real of this element
		*/	
        $.fn.getFake = function(){
			return $($(this).getFakeSelector()); 
		};
		/**
		    tell if the matched element has a real
		*/	
        $.fn.hasReal = function(mySelector){
        	var mySelector = mySelector ? mySelector : $(this).getSelector();
        	return  $.magic.reals[mySelector] != undefined && $.magic.reals[mySelector] != null;
		};
		
		/**
	    * 	This is private fonction : it moves the element to a real area in the DOM where we can manipulate them without impacting the workflow
	    *	this there is an element with the same size at its old place in the DOM 
	    */
	    $.fn.createReal = function(options) {return this._executeCreateReal(options);};
    	
	    $.fn._executeCreateReal = function(options) {
	    	if(typeof options=="boolean"){options = {create:options, index:0};}
	    	var toReturn = null;
	    	this.each(function() {  	
	    		var me = $(this); toReturn = me;
				var mySelector = me.getSelector();	
				var myId = me.attr("id");
				$.magic.locked.createReal = true;
				if(options && options.create==true && !me.isReal() && !me.hasReal(mySelector)) {
					//create real
					//transfert real and me
					var myCoordinates = me.coordinates();
					var cssParams = {width:me.width(), height:me.height()};
					for(var type in {"margin":"", "padding":""}){
						for(var direction in {"Top":"", "Right":"", "Bottom":"", "Left":""}){
							cssParams[type+direction] = me.css(type+direction);
						}
					}
					var myStyle=me.attr("style");
					myStyle = myStyle ? ' style="'+myStyle+'" savedstyle="'+myStyle+'"' :'savedstyle=" "';
					//insert fake
					var myNodeName = me[0].nodeName.toLowerCase();
					//transform me into real
	    			var fakeId = 'Fake-'+myId;
    				var fakeSelector = '#'+fakeId;
    				var myClass=me.attr("class");
    				me.before('<'+myNodeName+' id="'+fakeId+'" '+myStyle+' '+(myClass ? 'class="'+myClass+'"' : '')+'></'+myNodeName+'>');
					me.attr('realIndex', options.index);
					
					//manage events
					me.mouseenter($(this).transfertEvent);
					me.mouseleave($(this).transfertEvent);
					myNodeName = null;
	    			me.addClass("real");
	    			me.css(cssParams);
	    			//TODO veil foireux
	    			var reals = $.magic.realContainer.children();
	    			if(reals.length>0) {
	    				var veilIndex = $.magic.popInVeil ? reals.index($.magic.popInVeil) : -1;
		    			var insertingIndex = options.index % reals.length; 
	    				if(insertingIndex >=0 && veilIndex >=0) {
		    				me.insertBefore(reals.eq(Math.min(insertingIndex,veilIndex)));
		    			} else {
		    				me.insertAfter(reals.eq(Math.min(insertingIndex,veilIndex)));
		    			}	
	    			} else {
	    				$.magic.realContainer.prepend(me);
	    			}
	    			var futureMe = $(fakeSelector);
	    			futureMe.css(cssParams);
					if (!futureMe.hasClass("invisible")) {futureMe.addClass("invisible");}
	    			me = futureMe;
					
					//record the change
					$.magic.reals[fakeSelector] = mySelector;
					$.magic.fakes[mySelector] = fakeSelector;
						
	    		} else if((!options || options.create==false) && me.isReal()) {
	    			//come back home buddy (remove the real and put the element in its right place)
	    			var fake = me.getFake();
	    			if (fake.hasClass('poppedInReal')) {fake.removeClass('poppedInReal');}
					if (fake.hasClass('invisible')) {fake.removeClass('invisible');}
					fake.before(me);
					me.unbind("mouseenter",$(this).transfertEvent);
					me.unbind("mouseleave",$(this).transfertEvent);
					//me.attr("message", fake.attr("message"));
					me.attr("class", fake.attr("class"));
					me.attr("style", fake.attr("savedstyle"));
					fake.remove();
	    			delete $.magic.reals[fake.getSelector()];
					delete $.magic.fakes[mySelector];
					delete $.magic.coord.cache[mySelector];
	    		} 
	    		toReturn=me;
	    	});
			$.magic.locked.createReal = false;
			return toReturn;
	    };	
})(jQuery);

/*******************************************************
* 
* POSITION / ALIGN / LIMIT PART
* 
*******************************************************/
/** Array containing all the options and alignfunctions of all aligned elements. Key value are the ids of the elements */
$.magic.alignTargets = new Array;		//all the elements (selector : "#id") which are aligned
/** Array containing for each element all the ids of the element that are aligned to him */
$.magic.alignWatchers = new Array;		//all the elements (selector : "#id") which are aligned to
/** Array containing for each element its limit options, its activated limits and a private used startLimitValue */
$.magic.limit = new Array;		

//add locking flag for new critical functions
$.magic.locked.align=false;
$.magic.locked.unAlign=false;
$.magic.locked.limit=false;
$.magic.locked.refreshAlignWatchers=false;
	
$.magic._initWithoutAlign = $.magic.init;
$.magic.init = function() {
	$.magic._initWithoutAlign();
   	var alignFunction = function() {
		$.magic.coord.clearCache();
		for(x in $.magic.alignTargets) {
			var me = $(x);
			if(me==null) {continue;}
			if($.magic.alignTargets[x]) {
				$.magic.alignTargets[x].alignFunction();
				me.refreshAlignWatchers();	
			}
		}
		for(x in $.magic.limit) {
			var me = $(x);
			if(me==null) {continue;}
			me._limit();
		}
		return false;
	};
	if(!($.magic.browser.fixedSupport)) {
		$.magic.staticClass='static';
		if($.magic.browser.iStuff) {window.onscroll = alignFunction;} 
		else {
			//special case for !fixed support, we could do a cleartimeout + setimeout (300ms) to be less bruteforce
			$.magic.w.bind('scroll', alignFunction);
		}	
	} 
	$.magic.w.bind('resize', alignFunction);
	//$.magic.w.bind('orientationchange' , alignFunction);
};			
(function($) {
		/**
		   considering one element it refresh all the elements aligned to him or to one of its children 
		*/	
		$.fn.refreshAlignWatchers = function(mySelector){
			var me = $(this);
			if($.magic.locked.refreshAlignWatchers) {return;}
			$.magic.locked.refreshAlignWatchers = true;
			if(mySelector==undefined) {mySelector =me.getRealSelector();}
			var done = new Object;
			if($.magic.alignWatchers[mySelector] != undefined) {
				$.each($.magic.alignWatchers[mySelector], function(index, value) { 	
					if(!done[value]){
						$(value).align();
						done[value]=true;
					}
				});
    		}
			var childTargets= me.find('.alignTarget');
			$.each(childTargets, function() { 
				childTargetSelector = $(this).getRealSelector();	
				if(!done[childTargetSelector]){
					done[childTargetSelector]=true;
					if($.magic.alignWatchers[childTargetSelector] != undefined) {
						$.each($.magic.alignWatchers[childTargetSelector], function(index, value) { 
							if(!done[value]){
								done[value]=true;
								if($.magic.alignTargets[value]) {$(value).align($.magic.alignTargets[value].options);}
							}
						});
					}
				}
			}); 
			done = null;
			$.magic.locked.refreshAlignWatchers = false;
		};
		/**
		    get the coordinate of a single jquery object
		    @function
		    @return an array containing the asked coordinates
		*/	
		$.fn.coordinates = function(options)
        {
        	var returnSingleValue = null; var returnAll=false;
        	if(options==undefined || options==null){returnAll = true;}
        	else if (typeof options == "string") {returnSingleValue = options;options = new Array;options[returnSingleValue]=true; } 
			var toReturn = new Array;
			var me=$(this);
			var mySelector = me.getSelector();
			if(!($.magic.coord.cache[mySelector])) {
				//if cache for this element does not exists create it
				if($.isWindow(me[0])){	
					//window : no offset & outerWidth/outerHeight 
					$.magic.coord.cache[mySelector] = {left: $.magic.w.scrollLeft(), top:$.magic.w.scrollTop() , width:me.width(), height:window.innerHeight || me.height()};
					$.magic.coord.cache[mySelector].delta = {width:0, height:0};
				} else {
					//normal element
					var offset= me.offset();
					$.magic.coord.cache[mySelector] = {top:offset.top, left:offset.left, width:me.outerWidth(), height:me.outerHeight()};
					$.magic.coord.cache[mySelector].delta = {width:$.magic.coord.cache[mySelector].width - me.width(), height:$.magic.coord.cache[mySelector].height - me.height()};
				}	
				$.magic.coord.cache[mySelector].right = $.magic.coord.cache[mySelector].left+$.magic.coord.cache[mySelector].width; 
				$.magic.coord.cache[mySelector].bottom = $.magic.coord.cache[mySelector].top+$.magic.coord.cache[mySelector].height;
			}
			//fill the desired values and return
			if(returnAll) {return $.magic.coord.cache[mySelector];}
			for (var x in options) {if(options[x]==true) toReturn[x] = $.magic.coord.cache[mySelector][x];}
        	if(returnSingleValue) {return toReturn[returnSingleValue];}
			return toReturn;
        };
        
		/**
		 * given absolutes coordinates, return these coordinates in the frame of reference of this
		 * @param {Object} options
		 */
		$.fn.coordinatesOf = function(options)
        {
        	var me = $(this);
        	var returnSingleValue = null;
        	if (typeof options == "string") {returnSingleValue = options; } 
        	var myCoordinates = me.coordinates();
        	if($.isWindow(me[0])) {
        		var myScroll = {left:0, top:0};
        	} else {
        		var myScroll = {left:me.scrollLeft(), top:me.scrollTop()};
        	}
        	var toReturn = new Array;
        	for(var x in options) {
        		if(!$.magic.coord.isDirection(x) || options[x]=="auto") {toReturn[x]=options[x];continue;}
        		var myCoord = (myCoordinates[x] != undefined ? myCoordinates[x] : 0); //if x=="center" just keep the coordinate intact 
        		if($.magic.coord.isMaxValue(x)) {
        			toReturn[x] = myCoord - options[x];
        			if(myScroll[x]) {
        				toReturn[x] -= myScroll[x];
        			}
        		} 
				else {toReturn[x] = options[x] - myCoord;}
        	}
        	me=null;
        	if(returnSingleValue){return toReturn[returnSingleValue];}
        	return toReturn;
        };
		
		/**
		    set the limit of the element same parameters than align
		    @name limit
		    @function
		*/	
		$.fn.limit = function(options)
        {
        	options = $.magic.coord.cleanOptions(options, null);
        	delete options.manual;
        	return this.each(function() { 
				var target = $(this);
				//don't limit window
				if($.isWindow(target[0])){return;}
				var targetSelector = target.getRealSelector();
								
				$.magic.limit[targetSelector] = {options: options, limiting:new Array, unAligned: new Array, unactivatedValues:new Array, startLimitValue: new Array, unactivatedLimits : new Object};
				if($.magic.browser.fixedSupport) {
					$.magic.w.bind("scroll", function() {$(targetSelector)._limit();});
					$.magic.w.bind("resize", function() {$(targetSelector)._limit();});
				}		
			}); 
        };
		/**
		 * for previous compatibility
		 */
		$.fn.setLimit = function(options) {this.limit(options);return this;};
		
		/**
		 * private
         * _limit is called for each scroll/resize for elements who have limits activated
		 */ 
        $.fn._limit = function(){if ($.magic.locked.limit == false) {this._executeLimit();return this;}};
    	
    	/**
    	 * private
    	 * the critical section function limit
    	 */
		$.fn._executeLimit = function()
        {		//in case we are locked, cancel
				if ($.magic.locked.align == true || $.magic.locked.unAlign == true || $.magic.locked.createReal == true) {return;}
				
				// get real
				var realSelector = $(this).getRealSelector();
				var real = $(realSelector);
				
				//do nothing on invisible element
        		if(!real.isVisible()) {return;} 
				
				//get fake
				var fakeSelector =  $(this).getFakeSelector();	
				var fake = $(fakeSelector); 		

				//process stuffs on temp vars to reduce risks if we are called an other time
	    		if(!$.magic.limit[realSelector]){return;}	
				var tempLimit = $.extend(new Object,$.magic.limit[realSelector]);
				
				//start locking
				$.magic.locked.limit=true;
				
				//process the area used by the real / the area the real would have if not limited  
				var realCoordinates = real.coordinates();
				var area = {left:null, top:null, right:null, bottom:null, height:realCoordinates.height, width:realCoordinates.width};
				if ($.magic.alignTargets[realSelector]) {
					var tempAlignTargets = $.extend($.magic.alignTargets[realSelector]);
					//for each align 
					for (var side in tempAlignTargets.options) {
						//check if it is correct side
						if(tempAlignTargets.options[side] == null || !$.magic.coord.isDirection(side)){continue;}
						
						//get the selector and the element
						var alignedSelector = tempAlignTargets.options[side].selector;
						
						//Get the first matching elelement
						var aligned = $(alignedSelector).first();
						
						//get the potential real of this element
						aligned = aligned.getReal();
						
						//if this element is not visible skip it (cause its offset will return (0, 0)
						if(!aligned.isVisible()) {continue;} 
						
						//get the corresponding direction, its side and opposite side
						var oppositeSide = $.magic.coord.opposite(side);
						var myDimension = $.magic.coord.distanceToOpposite(real, side);
						//get the align value to have for this side
						var myValue = $.magic.coord.getValue({
							me:real, 
							side:side, 
							my:tempAlignTargets.options[side].my, 
							at:tempAlignTargets.options[side].at, 
							offset:tempAlignTargets.options[side].offset, 
							other:aligned
						}); 
						//fill the area for this side, note we overwrite any written area for this side
						area[side] = {
							value : myValue,
							options:tempAlignTargets.options[side],
							id: aligned.getSelector(), 
							direction:side,
							/* we add only non limits to the unaligned */
							add : tempLimit.limiting[side]!=alignedSelector /*|| ($.isWindow(tempLimit.limiting[side]) && $.isWindow(alignedSelector))*/
						};
						//fill the area for the opposite side, note we don't overwrite any written area for the opposite side
						if(!area[oppositeSide]) {
							area[oppositeSide] = {
								value:area[side].value + myDimension, 
								options:tempAlignTargets.options[side],
								id:area[side].id,
								direction:side,
								/* we add only non limits to the unaligned */
								add : area[side].add
							};
						}
					}
					//is this a manual or automatic align ?
					area.manual = tempAlignTargets.options.manual;
				}
				//fill the area with sides which are not aligned to anything.
				for (var x in area)	{ if(area[x]==null) {area[x] = {value:realCoordinates[x], options:{selector:realSelector, my:0, at:0, offset:0},direction:x, id:realSelector};}}
								
				//process the unaligned area : considering all the unaligned align this is the area closest to the edges the real would have if re-aligned.
				var unAlignedArea = {left:null, top:null, right:null, bottom:null};
				for (var side in tempLimit.unAligned) {
					//check if this side has got unaligned elements
					if(!tempLimit.unAligned[side]) {continue;}
					
					//get values needed in the for.
					var oppositeSide = $.magic.coord.opposite(side);
					
					//if we have limits waiting, skip unalign for this side
					if((tempLimit.unactivatedLimits[side]!= undefined && tempLimit.unactivatedLimits[side]!=null) || (tempLimit.unactivatedLimits[oppositeSide]!= undefined && tempLimit.unactivatedLimits[oppositeSide]!=null)) {
						continue;
					}
					var isMaxSide = $.magic.coord.isMaxValue(side);
					var myDimension = $.magic.coord.distanceToOpposite(real, side);
					for (var index = 0; index < tempLimit.unAligned[side].length; index++) {
						//for each unaligned for this side
						var unAligned = tempLimit.unAligned[side][index];
						
						//get the jquery element of this unAligned
						var unAlignedElement = $(unAligned.options.selector).getReal();
						
						//if this element is not visible, skip it
						if(!unAlignedElement.isVisible()) {continue;} 
						
						//get the align value to have for this side
						var myValue = $.magic.coord.getValue({
							me:real, 
							side:unAligned.direction, 
							my:unAligned.options.my, 
							at:unAligned.options.at, 
							offset:unAligned.options.offset, 
							other:unAlignedElement
						}); 	
						//get the values of this unaligned
						var tempAreaSide = {
							value : myValue,
							direction:side,
							options:unAligned.options,
							id : unAligned.id
						};
						//if this unaligned side is opposite to its application, have to add the opposite distance
						//we have to add the dimension if we processed the value for the other side
						if(oppositeSide == unAligned.direction) {tempAreaSide.value -= myDimension;} 
						//if this unaligned side is opposite to its application, have to add the opposite distance
						if(area.manual ==false && tempLimit.startLimitValue[side]) {
							//real Value is to evaluate the clip for this specific side
							tempAreaSide.realValue = tempAreaSide.value;
							tempAreaSide.value = isMaxSide ? Math.min(tempAreaSide.value, area[side].value) : Math.max(tempAreaSide.value, area[side].value) ;
						}
						//fill the area for the opposite side, note we don't overwrite any written area for the opposite side
						var tempAreaOppositeSide = {
							value:tempAreaSide.value + myDimension, 
							options:unAligned.options,
							direction:side,
							id : tempAreaSide.id
						};
						
						//if limited to opposite side : limit unaligned area also
						if(area.manual ==false && tempLimit.startLimitValue[oppositeSide]) {
							tempAreaOppositeSide.value = isMaxSide ? Math.max(tempAreaOppositeSide.value, area[side].value) : Math.min(tempAreaOppositeSide.value, area[side].value) ;
							tempAreaSide.value = tempAreaOppositeSide.value -myDimension;
						}
						
						//tell if this side is more far from the screen than the current unaligned area side 
						var worseSide = !unAlignedArea[side] 
								|| ((tempAreaSide.value < unAlignedArea[side].value) == isMaxSide) 
								|| (tempAreaSide.value == unAlignedArea[side].value && tempAreaSide.direction==side);	//direct align get the lead

						//tell if this opposite side is more far from the screen than the current unaligned area opposite side
						var worseOppositeSide = !unAlignedArea[oppositeSide] 
								|| (tempAreaOppositeSide.value < unAlignedArea[oppositeSide].value) == isMaxSide
								|| (tempAreaSide.direction==oppositeSide && tempAreaSide.value == unAlignedArea[side].value); //direct align get the lead
						
						if(worseSide) {
							unAlignedArea[side] = tempAreaSide;
							unAlignedArea[side].unAligned = unAligned;
						}
						//apply if needed for the opposite side
						if(worseOppositeSide) {
							unAlignedArea[oppositeSide] = tempAreaOppositeSide;	
							unAlignedArea[oppositeSide].unAligned = unAligned; 
						}	
					}
				}
										
				//prepare the var used afterward
				var unAlignParams = new Object; var alignParams = new Object;
				var limitsActivated = new Object;var limitsUnactivated = new Object;
				var alignNeeded = false;var unAlignNeeded = false;
				var throwNewActiveLimitsEvent =false;var throwNewUnactiveLimitsEvent =false;
				//process the clips
				var clip=new Object;
				var unClip = new Object;
				
				for (var side in tempLimit.options) { 
					//process the limit's clip of the real for each direction x
					if (tempLimit.options[side] == null || tempLimit.options[side] == undefined) {continue;}
					var oppositeSide = $.magic.coord.opposite(side);
					var isMaxSide = $.magic.coord.isMaxValue(side);
					
					//Get the worst matching elelement
					var elementSelector = tempLimit.options[side].selector;
					var elementId = elementSelector;
					var element = $(elementSelector);
					if(element.length>1) {
						element = element.not(".real, "+fakeSelector+", #realContainerWrapper, #realContainer");
						var myElement = null;
						var myValue = null;
						for(var i =0; i<element.length; i++) {
							var elementI = $(element[i]);
							var myValueI = $.magic.coord.getValue({
								me:real, 
								side:side, 
								my:0, 
								at:tempLimit.options[side].at, 
								offset:0, 
								other:elementI
							}); 
							if(myElement==null || ((myValueI<= myValue) == isMaxSide)) {
								myElement = elementI;
								myValue=myValueI;
							}	
						}
						element = myElement;
					}
					
					//get the potential real of this element
					element = element.getReal();
					elementId = element.getSelector();
					
					//if the element is not visible the offset() will return (0, 0), let's skip this element until it's visible 
					if(!element.isVisible()) {continue;} 
					var myValue = $.magic.coord.getValue({
						me:real, 
						side:side, 
						my:tempLimit.options[side].my, 
						at:tempLimit.options[side].at, 
						offset:tempLimit.options[side].offset, 
						other:element
					}); 
					
					var tempClip = {
						options:$.extend(new Object,tempLimit.options[side]),
						value:myValue, 
						direction:side,
						id:elementId
					}; 
					var currentLimitValue =  tempLimit.startLimitValue[side];
					//is the element active or not ?
					var active = tempLimit.limiting[side]!= undefined && tempLimit.limiting[side]== elementId;	
					var alignedOrAlignedTo =  ($.magic.alignTargets[realSelector] !=undefined && $.magic.alignTargets[realSelector].options[side] !=null && $.magic.alignTargets[realSelector].options[side].selector==elementId) 
						|| ($.magic.alignTargets[elementId]!=undefined && $.magic.alignTargets[elementId].options[side] !=null && $.magic.alignTargets[elementId].options[side].selector==realSelector);
					
					if (//current align is no more outside the clip
						((area[side].value < tempClip.value) == isMaxSide && (area[side].value != tempClip.value)) ||
						//OR get beyond the limit launch
						(currentLimitValue!= undefined && (area[side].value > currentLimitValue) == isMaxSide && area[side].value != currentLimitValue) ||
						//OR 
						(	//unaligned exists and is not the same element as the clip
							
							unAlignedArea[side] != null 
				 			&& unAlignedArea[side] != undefined
					 		&& unAlignedArea[side].options.selector != tempClip.options.selector 
					 		//AND
					 		&& ((	//OR this is a manual align  and is inside the clip area
									area.manual == true
								 	&& unAlignedArea[side].value != tempClip.value 
							 		&& ((unAlignedArea[side].value < tempClip.value) == isMaxSide)
								) ||	//OR this is a non-manual align  and is inside the REAL clip area
					 			(	area.manual ==false 
									&& unAlignedArea[side].realValue !=undefined 
									&& unAlignedArea[side].realValue != tempClip.value 
							 		&& ((unAlignedArea[side].realValue < tempClip.value) == isMaxSide)
								)
							)
						))  {
						/*********************************************************/
						/************* THIS CLIP SHOULD BE UN-ACTIVE *************/
						/*********************************************************/
						//it has been activated by memory, no more valid : cancel the clip
						if(clip[side] && clip[side].options !=undefined && clip[side].options !=null && clip[side].options.selector== elementSelector) {delete clip[side];}
						
						//if active : un-limit
						if(active){
							unClip[side]=tempClip;
							unClip[side].update = true;		
						} 
						//if there is a waiting clip on this side or opposite active it then
						if (tempLimit.unactivatedLimits[side]){
							clip[side]=tempLimit.unactivatedLimits[side];
							clip[side].update = true;					
						} else if (tempLimit.unactivatedLimits[oppositeSide]){
							clip[oppositeSide]=tempLimit.unactivatedLimits[oppositeSide];
							clip[oppositeSide].update = true;	
						}
						//it was unactive limit, this is no more unactive limit but the value can come back
						delete tempLimit.unactivatedLimits[side];
						delete tempLimit.unactivatedLimits[oppositeSide];
					} else if((area[side].value > tempClip.value) == isMaxSide || active && area[side].value == tempClip.value || alignedOrAlignedTo){
						/*********************************************************/
						/************** THIS CLIP SHOULD BE ACTIVE ***************/
						/*********************************************************/
						//if we are in the waiting list : wait cause there is a fresher clip active
						if(tempLimit.unactivatedLimits[side] && tempLimit.unactivatedLimits[side].options.selector== elementSelector){continue;}
						//we are not active and there is a current limit active in our side or oppositeSide : replace her
						//case we already processed the other limit
							if(!active && clip[side] && !clip[side].update) {
								tempLimit.unactivatedLimits[side] = clip[side];
								tempLimit.unactivatedValues[side] = currentLimitValue;
								unClip[side] = clip[side];
								unClip[side].update = true;
							}	
			
							if(!active && clip[oppositeSide] && !clip[oppositeSide].update) {
								tempLimit.unactivatedLimits[oppositeSide] = clip[oppositeSide];
								tempLimit.unactivatedValues[oppositeSide] = tempLimit.startLimitValue[oppositeSide];
								unClip[oppositeSide] = clip[oppositeSide];
								unClip[oppositeSide].update = true;
								delete clip[oppositeSide];
							}
						//case we did not yet process the other limit	
							if(!active && tempLimit.startLimitValue[side]){
								tempLimit.unactivatedValues[side] = tempLimit.startLimitValue[side];
							}
							if(!active && tempLimit.startLimitValue[oppositeSide]){
								tempLimit.unactivatedValues[oppositeSide] = tempLimit.startLimitValue[oppositeSide];
							}
						
						//we are active and are taken over by a not active => record me and unclip me
						if (active && ((clip[side] && clip[side].update) || (clip[oppositeSide] && clip[oppositeSide].update))) {
							unClip[side] = tempClip;
							unClip[side].update = true;
							continue;
						}
						//clip me	
						clip[side]=tempClip;
						clip[side].update = !active;
					}
				}
				//clip every clip not active we want to clip
				//is there a manual align
				for (var side in clip){
					if(!$.isWindow(clip[side].options.selector) && !clip[side].update) {continue;}
					if(clip[side].update) {
						//this is an active limit
						tempLimit.limiting[side] = clip[side].id;
						var oppositeSide = $.magic.coord.opposite(side);
							
						if(tempLimit.unactivatedValues[side]) {
							//from a record : get back the proper limit value
							tempLimit.startLimitValue[side] =tempLimit.unactivatedValues[side];
						} else {
							tempLimit.startLimitValue[side] = area[side].value;
						}
						//we'll have to align stuffs
						throwNewActiveLimitsEvent = true;
						throwNewActiveLimitsEvent = true;
						limitsActivated[clip[side].direction] = clip[side].options.selector;
						
						//don't overwrite unAlignParam
						if (!unAlignParams[side] && area[side].id != realSelector) {
							unAlignNeeded = true; unAlignParams[side] = area[side];
						}	
						if (!unAlignParams[oppositeSide] && area[oppositeSide].id != realSelector && area[side].id == area[oppositeSide].id && area[side].direction == area[oppositeSide].direction) {
							//if we are only aligned to one element in side + opposite side, we unaligned it also in the opposite side
							unAlignNeeded = true; unAlignParams[oppositeSide] =  area[oppositeSide];
						}	
					}
					
					//overwrite alignParam
					alignNeeded=true; 
					alignParams[side] = clip[side];
				}
				//un clip every active clip we want to unclip
				for (var side in unClip){
					if(!unClip[side].update) {continue;}
					var oppositeSide = $.magic.coord.opposite(side);
					//this is no more an active limit
					delete tempLimit.limiting[side];
					delete tempLimit.startLimitValue[side];
					
					//only unalign one time cause the first unalign is the real current aligned element
					if (!unAlignParams[side]) {
						unAlignNeeded=true;
						unAlignParams[side] = unClip[side];
						unAlignParams[side].add = false;
						throwNewUnactiveLimitsEvent = true;
						limitsUnactivated[unClip[side].direction] = unClip[side].options.selector;
					}
					//align the best unaligned element != clip for this side and the opposite side 
					if((area.manual == true || (area.manual == false && unAlignedArea[side] && unAlignedArea[side].realValue !=undefined && clip[side]== undefined && clip[oppositeSide]==undefined)) && unAlignedArea[side] && unAlignedArea[side].unAligned && unAlignedArea[side].options.selector != unClip[side].options.selector ) {
						alignNeeded = true;
						alignParams[side] = unAlignedArea[side].unAligned;
						delete tempLimit.unactivatedValues[side];
					}
					if(area.manual == true && unAlignedArea[oppositeSide] && unAlignedArea[oppositeSide].unAligned && unAlignedArea[oppositeSide].options.selector != unClip[side].options.selector ) {
						alignNeeded = true;
						alignParams[oppositeSide] = unAlignedArea[oppositeSide].unAligned;
						delete tempLimit.unactivatedValues[oppositeSide];
					}
				}
				//add new unaligned params to unaligned hash table
				for (var i in unAlignParams) {
					
					if(unAlignParams[i].add!=true) {continue;}
					if(!tempLimit.unAligned[i]) {tempLimit.unAligned[i] = new Array;}
					tempLimit.unAligned[i].push({
						options:unAlignParams[i].options,
						direction:unAlignParams[i].direction,
						id:unAlignParams[i].id
					});
					tempLimit.unAligned[i] = $.magic.tools.removeDuplicates(tempLimit.unAligned[i]);
				}
				
				//unAlign needed unalign elements
				if(unAlignNeeded) {
					var unAlignParamsValues = {manual:true};
					for (var k in unAlignParams) {
						unAlignParamsValues[unAlignParams[k].direction] = $.extend(new Object, unAlignParams[k].options);
					}
					fake = fake.unAlign(unAlignParamsValues);
				}
				//align needed align elements
				if(alignNeeded) {
					if(!real.isReal()) {
						//if real has no real, create real
						fake.createReal(true);
						real = fake.getReal();
					}
					var alignParamsValues = {manual:true};
					
					//prepare the parameters for the align
					for (var side in alignParams) {
						
						var oppositeSide = $.magic.coord.opposite(side);
						if(alignParams[side].id != realSelector && $.magic.coord.isDirection(side)) {
						 	// delete it from limit.unAligned
							alignParamsValues[alignParams[side].direction] = $.extend(new Object,alignParams[side].options);
							alignParamsValues[alignParams[side].direction].selector =alignParams[side].id;
							
							//remove the element from the unaligned lists (as we are aligning it again) 
							tempLimit.unAligned[side] = $.magic.tools.removeItems(tempLimit.unAligned[side], [{options:alignParams[side].options, direction:alignParams[side].direction,id:alignParams[side].id}]);
							tempLimit.unAligned[oppositeSide] = $.magic.tools.removeItems(tempLimit.unAligned[oppositeSide],  [{options:alignParams[side].options, direction:alignParams[side].direction, id:alignParams[side].id}]);
						}
					}
					//align the desired elements
					fake.align(alignParamsValues);	
				}

				$.magic.limit[realSelector] = $.extend(new Object,tempLimit);
				tempLimit = null;
				
				//stop the critical section
				$.magic.locked.limit = false;
				//throw event with the limit we activated and desactivated
				if(throwNewUnactiveLimitsEvent) {$.magic.w.trigger("unLimit", realSelector, [limitsUnactivated]);}
				if(throwNewActiveLimitsEvent) {$.magic.w.trigger("limit", realSelector, [limitsActivated]);}
				
				//as we changed something, refresh.
				if (alignNeeded || unAlignNeeded) {
					real.refreshAlignWatchers(realSelector);
				}
        };

		/**
		 * aligne the element to the one specified by their selector
		 * $("#tempLimit").align({top:'elementN', right:"elementE", bottom:"elementS", left:"elementW"});
		 * 
		 * of course it is possible not to specify parameters if we don't want to align in that direction (any param is obtionnal)
		 * in the case of a total alignment it is possible to do : 
		 * $("#target").align("element");
		 * which is equivalent to  $("#target").align({top:'element', right:"element", bottom:"element", left:"element"});
		 */ 
        $.fn.align = function(options) {
			if ($.magic.locked.align == true){console.log('fucked in align');return;} return this._executeAlign(options);						
		};
    	$.fn._executeAlign = function(options)
        {
        	if(options) {
        		// why options = $.magic.coord.cleanOptions(options, null); does not work here ???? same code !
    			if ($.magic.isSelector(options)) {
    				options = {
    					top: {my:0,at:0,selector:options, offset:0},  
    					right: {my:0,at:0,selector:options, offset:0},  
    					bottom: {my:0,at:0,selector:options, offset:0},  
    					left: {my:0,at:0,selector:options, offset:0}
    				};  
    			} 
				var defaults = {top: null, right: null, bottom: null, left: null, manual:true}; 
				options =  $.extend(new Object, defaults, options); 	
    		}	
    		return this.each(function() { 
        		var fakeSelector = $(this).getFakeSelector();
        		var realSelector = $(this).getRealSelector();
				
				var fake = $(fakeSelector);			
				var real = $(realSelector);
	    		
	    		var fakeOffset = fake.coordinates();
	    		
				//manipulate temp var
	    		var tempAlignTargets = $.magic.alignTargets[realSelector];
				var tempAlignWatchers = $.magic.alignWatchers;
				
	    		//if first call => bind any change
				if(tempAlignTargets==undefined || tempAlignTargets==null ) {
	    			options = $.magic.coord.cleanOptions(options, null);
        			tempAlignTargets = {
	    				options : options, 
	    				id:realSelector,
	    				alignFunction : function() {$(this.id).align();}
	    			};
	    			fake.parent().resize(tempAlignTargets.alignFunction); //This does not work sometimes oO. The next line fix that (wtf) 
	    			//fake.parent().resize(function(){tempAlignTargets.alignFunction();});
				} else if(options){
					//merge the new options with the old ones
	    			//options.manual = tempAlignTargets.options.manual + options.manual;
					//tempAlignTargets.options.manual = tempAlignTargets.options.manual && options.manual;
					tempAlignTargets.options.manual = tempAlignTargets.options.manual ? options.manual : !options.manual; //if true + false => false, true+true => true, false+true => false, false + false => true
					options.manual=null;
					tempAlignTargets.options = $.magic.coord.cleanOptions(options, tempAlignTargets.options);
				}
				//start critical section here
				$.magic.locked.align=true;
					
				//an element is !fixed by default and if aligned to a fixed element, become fixed.
				var fixed=false;
				
				var papa = real.parent();
				
	    		//get positions
				var elements = new Object;
	    		var elementCounts = 0;
	    		var lastAlignedToScreen = null;
	    		var alignValues = {top:"auto",right:"auto",bottom:"auto", left:'auto'};
				
				//for each option
				for (x in tempAlignTargets.options) {
					//if the option is null or is the element itself, skip it
					if(tempAlignTargets.options[x] == null || !$.magic.coord.isDirection(x) || tempAlignTargets.options[x].selector==realSelector) {continue;} 
					
					//get the element corresponding to this elementId
					elements[x] = $(tempAlignTargets.options[x].selector).getReal();
						
					//add the realSelector to the align watchers of the option[x] so we know afterwards 
					//that the realSelector is aligned to this element 
					if(tempAlignWatchers[tempAlignTargets.options[x].selector]==null) {
						tempAlignWatchers[tempAlignTargets.options[x].selector] = new Array(realSelector);
					} else {
						tempAlignWatchers[tempAlignTargets.options[x].selector].push(realSelector);
						tempAlignWatchers[tempAlignTargets.options[x].selector]=$.magic.tools.removeDuplicates(tempAlignWatchers[tempAlignTargets.options[x].selector]);
					} 
					
					if ($.isWindow(elements[x][0]) && $.magic.coord.isVertical(x)) {
						 //real get fixed if align to a vertical position of the screen
						fixed=true;
					} else { 
						//if the element is not visible the offset() will return (0, 0), let's skip this element until it's visible
						if(!elements[x].isVisible()){continue;} 
						
						//mark the element as an align Target
						if(!elements[x].hasClass("alignTarget")) {elements[x].addClass("alignTarget");}
						
						//if the element to which we are aligned to has got an ancestor which is fixed, we are fixed (this one is heavy line).
						if(fixed==false && (elements[x].closest('.'+$.magic.staticClass).length>0)) {fixed=true;}
					}
					elementCounts++;
					alignValues[x] = $.magic.coord.getValue({
						me:real, 
						side:x, 
						my:tempAlignTargets.options[x].my, 
						at:tempAlignTargets.options[x].at, 
						offset:tempAlignTargets.options[x].offset, 
						other:elements[x]
					});
				}
				if(!real.isReal() && real.hasClass($.magic.staticClass)){
	    			//if real has static class (fixed) we remove it by default
	    			real.removeClass($.magic.staticClass);
	    		}
	    		
				//if we did not touch left+right / top+bottom put the real offset for these values.
				if(alignValues.left == 'auto' && alignValues.right == 'auto') {alignValues.left = fakeOffset.left;if(tempAlignTargets.options.left && tempAlignTargets.options.left.offset){alignValues.left +=tempAlignTargets.options.left.offset;}}
				if(alignValues.top == 'auto' && alignValues.bottom == 'auto') {alignValues.top = fakeOffset.top;if(tempAlignTargets.options.top && tempAlignTargets.options.top.offset){alignValues.top +=tempAlignTargets.options.top.offset;}}
				//if we have to align to something
				if(elementCounts!=0){	
					//now that we have the values with the window as frame of reference, we'll set the values for the proper frame of reference.
					//if we are (fixed==false) or (fixed==true && support fixed) we set the father as frame of reference) otherwise, the window is the frame of reference.
					var frameOfReference = papa;
					if(fixed && $.magic.browser.fixedSupport) {
						//fixed and fixed support => window as frame of reference
						frameOfReference = $.magic.w;
						alignValues = $.magic.w.coordinatesOf(alignValues);
						//remove class absolute and add class fixed
						if (!real.hasClass($.magic.staticClass)) {real.addClass($.magic.staticClass);}
						if (real.hasClass("absolute")) {papa.removeClass("absolute");}
					} else {
						//otherwise dad is the frame of reference and we remove the fixed class and add the absolute class
						if (!real.hasClass("absolute")) {real.addClass("absolute");}
						if (real.hasClass($.magic.staticClass)) {real.removeClass($.magic.staticClass);}
						papa.css({position:'relative'});
						alignValues = papa.coordinatesOf(alignValues);
					}
					var frameOfReferenceCoordinates = frameOfReference.coordinates();
					if(alignValues.top != "auto" && alignValues.bottom !='auto') {alignValues.height = frameOfReferenceCoordinates.height - alignValues.bottom - alignValues.top - fakeOffset.delta.height;}
		    		if(alignValues.right != "auto"&& alignValues.left!= "auto") {alignValues.width = frameOfReferenceCoordinates.width - alignValues.right - alignValues.left - fakeOffset.delta.width;}
					frameOfReference=null;
					
					//finally apply the alignvalues
					$.magic.applyPosition(real, realSelector, alignValues);
				}
				//in any case : end critical section
	    		$.magic.locked.align=false;	
				
				//and transfer temp var to real ones
				$.magic.alignWatchers = tempAlignWatchers; tempAlignWatchers = null;
				$.magic.alignTargets[realSelector] = tempAlignTargets ; tempAlignTargets=null;
				if($.magic.locked.refreshAlignWatchers){return;}
				if(elementCounts!=0){	
					//only if we aligned to something, check if we changed and if yes refresh
					var newTargetOffset = fake.coordinates();
					//if we changed something then refresh the elements that are aligned to real
					if (!$.magic.tools.areHashEqual(newTargetOffset, fakeOffset)) {
						real.refreshAlignWatchers(realSelector);
					}
				}
			}); 
        };
        /**
         * 	unalign the element with the options (same as align)
		 */ 
        $.fn.unAlign = function(options) {while ($.magic.locked.unAlign == true){} return this._executeUnAlign(options);};
    	$.fn._executeUnAlign = function(options){
		 	//start locking unalign
		 	$.magic.locked.unAlign=true;	
		 	var toReturn = null;
		 	if ($.magic.isSelector(options)) {options = {top: options, right: options, bottom: options, left: options,  manual:true};}
		 	var defaults = {top: null, right: null, bottom: null, left: null, manual:true}; 
			options =  $.extend(new Object, defaults, options); 
			options = $.magic.coord.cleanOptions(options, null);
			this.each(function(){
				var realSelector = $(this).getRealSelector();
				var real = $(realSelector);
				toReturn = real;
				
				//manipulate temp var
				var tempAlignTargets = $.magic.alignTargets[realSelector];
				var tempAlignWatchers = $.magic.alignWatchers;	
				
				//element count = number of elements we were aligned to
				var elementCounts=0;
				
				//staying properties = number of element we still are aligned to
				var stayingProperties=0;
				if(tempAlignTargets) {
					for(var x in tempAlignTargets.options) {
						if(tempAlignTargets.options[x] != null && $.magic.coord.isDirection(x)){
							//this is a real element we were aligned to
							elementCounts++;
							if(options[x]!=undefined && options[x]!=null && ($(tempAlignTargets.options[x].selector).is(options[x].selector) || ($.isWindow(tempAlignTargets.options[x].selector) && $.isWindow(options[x].selector)))){
								//we want to unalign this element
								$.magic.alignWatchers[tempAlignTargets.options[x].selector] = $.magic.tools.removeItems($.magic.alignWatchers[tempAlignTargets.options[x].selector], [realSelector]); 
								tempAlignTargets.options[x]=null;	
							} else {stayingProperties++;}
						}
					}
					tempAlignTargets.options.manual = tempAlignTargets.options.manual ? options.manual : !options.manual; //if true + false => false, true+true => true, false+true => false, false + false => true
				}
				
				//there is nothing to which we were aligned to, then leave the function
				if(elementCounts==0){$.magic.locked.unAlign=false; return;}
				if(stayingProperties==0) {
					
					//there is not any more element to which we are aligned to
					//if we are not popped in then delete the real otherwise update the position (absolute is for updating the position of the real)
					if(!real.hasClass("poppedIn")){
						if($.magic.locked.createReal!=true){
							real=real.createReal(false);
						}
						if($.magic.browser.fixedSupport){
							//unbind the resize event
							real.parent().unbind('resize', tempAlignTargets.alignFunction);
						}
					} else {real = real.setPosition("absolute");}
					toReturn = real;
					//delete the alignTargets if real
					tempAlignTargets = null;
				}
				//unlock
				$.magic.locked.unAlign=false;
				//transfer temp var to real ones
				if (tempAlignTargets) {
					$.magic.alignTargets[realSelector] = tempAlignTargets;
				} else {delete $.magic.alignTargets[realSelector];}
			});
		 	return toReturn;
		 };     
		
	    /**
		setPosition("fixed") : fix the element on the screen
		setPosition("absolute") : fix the element on the page
		setPosition(null) : set back the element at his place
		 */ 
	    $.fn.setPosition = function(options) {
			if(options==null || typeof options == "string") {options = {position:options, offset:new Array, index:0};}
			var defaults = {position: "absolute", offset:new Array};  
			var options = $.extend(defaults, options);  
			return this.each(function() { 
		    	var me = $(this);
		    	var myId = me.getSelector();	
				if (options.position == null && me.isReal()) {
		    		if (!$.magic.locked.unAlign && $.magic.alignTargets[myId]) {
		    			me.unAlign($.magic.alignTargets[myId].options);
		    		}
		    		me.createReal(false);
		    		//clean memory also if it has
		    		if($.magic.limit[myId]) {
		    			$.magic.limit[myId].limiting=new Array;
		    			$.magic.limit[myId].unactivatedValues=new Array;
		    			$.magic.limit[myId].unactivatedLimits=new Array;
		    			$.magic.limit[myId].unAligned=new Array;
		    			$.magic.limit[myId].startLimitValue=new Array;
		    		}
		    	} else if(options.position =="absolute" || (options.position =="fixed" )){
		    		var myCoordinates = me.coordinates();
		    		if(!me.hasReal(myId)){
		    			me.createReal({create:true, index:options.index});
		    			me = $(myId);
			    	} else {
			    		myCoordinates=me.getReal().coordinates();
			    	}
		    		if(me.hasClass("hadReal")){me.removeClass("hadReal");}
		    		//default values for "fixed"
		    		var myOffset = {left:myCoordinates.left, top:myCoordinates.top};
		    		if (options.position=="absolute") {
		    			var frameOfReference = me.parent();
		    			var frameOfReferenceId = frameOfReference.getSelector();	
		    		} else {
		    			var frameOfReferenceId = window;
		    			var frameOfReference = $.magic.w;
		    		}
		    		myCoordinates = frameOfReference.coordinatesOf(myCoordinates);
		    		var myOffset =  {left:myCoordinates.left, top:myCoordinates.top};	
		    		//add parameters offsets
		    		myOffset.left = options.offset.left ? myOffset.left + options.offset.left : options.offset.right ? myOffset.left - options.offset.right : myOffset.left;
		    		myOffset.top = options.offset.top ? myOffset.top + options.offset.top : options.offset.bottom ? myOffset.top - options.offset.bottom : myOffset.top;
		    		me.align({left:{my:0, at:0, offset:myOffset.left, selector:frameOfReferenceId}, top:{my:0, at:0, offset:myOffset.top, selector:frameOfReferenceId}, manual : false}); //this is not a manual align, it can be limited by a conflict limit.
		    	} 
		    	me.getReal().trigger("position", options);
				
			});
	    };
	   	
})(jQuery);
