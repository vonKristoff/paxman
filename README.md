#PAXMAN.js

###A Scrolling Engine for making sweet static single paged websites, quickly, and by using HTML markup as config.

##TODO's
* window resize listeners
* incude more css transforms
* x-scrolling background
* scrolling speeds need adjusting to screen dimensions! (real bugger)

##Major Features
* Parallax scrolling for Backgrounds
* Anchor triggered Class additions/removals
* SVG Masking
* Child Vectors

===

###Quick Start

**HTML markup**

You need a parent container with its CSS `position` set to `relative`.
Stack your seperate scrolling areas via the `section` element.
If you want Child Vectors, use the special `.px-child` class notifier.

	<div id="container">
  		<section data-bg="image.png">
  			<div class="px-child"></div>
  			<div>static content</div>
  		</section>
  	</div>

**Inline Options**
_no items are required_

* `data-bg` The Path to section background. When Masking a 2nd image may be passed with a comma seperator, to be the image that gets masked into. ie: `data-bg="img-1.jpg, img-2.jpg"`
* `data-scroll` *top*, *mid*, *bottom*, *left*, *right* or *reverse* are scroll direction behaviours.
* `data-speed` Speed of background parallax scroll. `0` - `1` as a decimal.
* `data-height` *auto-screen*, *full-screen*, *half-screen*
* `data-mask` Path to an `SVG` to enable masking.


**PX-Child** Options

* `data-fn` The custom function name to assign to this section's child.
* `data-offset` Incomplete - but starting x y co-ords.

===
###Writing Custom Functions
When you have `.px-child` elements, they act as Vectors, and so can be controlled through harnessing the range fed back on scroll between 0 and 1 from the parent section. You create custom functions like so:

	// initialise the module, and get back the extend function
	var customFeatures = new Paxman();

  	customFeatures.extend('custom_name', function (item, parent, count){
  	// [item] by default the current item (px-child) is passed back with all of its data
  	// [parent ]And the parent object is too which supplies the current PERCENTAGE of completion
  	// [count] Also a helpful incremental count is passed back from the scroll listener that makes it useful for sine waves etc.
  	// [item.seed] is a random number that is set be the model and applied to the child so that it can be used to induce randomness.
  	// there are lots more useful bits of data passed back.
  	
  	// The general rule of thumb for animating an object from A to B is
    // diff       = target - start; 
    // currentpos = diff * parent.pct;
    	
    // You create a style object that you can pass back the following
    	style = {
    		x: float value,
    		y: float value,
    		friction: decimal value,
    		opacity: decimal value,
    		'background-color': yourAppropriateCSSvalue
    	};
    	return style;
  	});
 
 Then match your custom function to the child you wish to animate:
 
 	<div class="px-child" data-fn="custom_name"></div>
 	<div class="px-child" data-fn="custom_name"></div>
 	<div class="px-child" data-fn="custom_name"></div>
 
 You can have plenty of children - all of which will be assigned an `id` so that your function will iterate through each one making starfields a breeze.