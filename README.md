# Magic jQuery

## setPosition : 

The function setPosition specify a new position (like the position in CSS) with a translate offset option.
Technically, there is a Ghost inserted at the exact place and dimensions of the element beeing moved, the layout is not modified.
This function will simulate the CSS position attribute even for browsers which don't normally accept it (such as ie6, iPhone, iPad or other mobile's browsers).

### The requiered parameter can be 

* null : the element go back to its DOM position, 
* "absolute" : The element has now an "absolute" positioin without impacting the DOM layout
* "fixed" : The element has now a "fixed" positioin without impacting the DOM layout

### The extra parameter offset is optional : 

Offset parameter can have any of those values specified 

```html
offset : 
{
    top: value,
    left: value,
    bottom: value
    right: value
}
```

###Event triggered

When setPosition is called the element on which it is applied trigger an event "position". The data of the event contains the new position ("absolute", "fixed" or null) 

## align : 

 The function `align` specify for each desired direction (`top`, `right`, `bottom`, `left`) the element to which the matched elements are aligned to. If the elements to which the matched elements are aligned to are moved or resized, align will refresh automatically the position of the matched elements. You can specify for each side you want :

 * just any jQuery selector of element to which it is aligned to. Align will align to the first of the matching elements.
 
 Or specify

```html
{my:XX, at:XX, offset:XX, selector:a_jQuery_Selector}
```

* `my` : any float, this is normalized percentages of the target's dimension for this direction
* `at` : any float, this is normalized percentages of the aligned element's dimension for this direction
* `offset` : in positive or negative PX, add this value to the calculated position
* `selector` : any jQuery selector, will choose the first one

Exemples : 

```html
//you want to align the <div id="myDiv"></div> fully to the window write
$("#myDiv").align(window);

//you want to align the right of <div id="myDiv"></div> to the left of <span id="mySpan"></span> write
$("#myDiv").align({right:{at:1, selector:'#mySpan'}}); 

//you want to align the left of <div id="myDiv"></div> to the right of <span id="mySpan"></span> + an offset of 30px, write
$("#myDiv").align({left:{my:0.5,at:0.5, selector:'#mySpan'}, top:{my:0.5,at:0.5, selector:'#mySpan'}}); 
```

## limit

The function `limit` specify for each desired direction the elements by which the calling element's movement is limited.

In other words when the matched element would begin collision with a limit element (including the offset and parameters) it is aligned to this limit with the specified offset and other parameters and unaligned as soon as the collision ends.

if you want to limit by the window (the element will never get out) then write window.
two syntaxes accepted (just same as align function):

* just any jQuery selector of element to which it is aligned to. Align will align to the first of the matching elements.
 
Or specify

```html
{my:XX, at:XX, offset:XX, selector:a_jQuery_Selector}
```

* `my` : any float, this is normalized percentages of the target's dimension for this direction
* `at` : any float, this is normalized percentages of the aligned element's dimension for this direction
* `offset` : in positive or negative PX, add this value to the calculated position
* `selector` : any jQuery selector, will choose the first one

Event triggered

When a limit is activated, the element on which it is applied trigger an event "limit". The data of the events contains the new activated limits. When a limit is unactivated it triggers an event "unlimit", the data of the events contains the unactivated limits.

Exemples : 

```html
//If you want that the element <div id="myDiv"></div> doesn't go outside the visible screen : 
$("#myDiv").limit(window);

//you want to limit the bottom of <div id="myDiv"></div> to the top of <div id="footer"></div> and its top to to the bottom of <div id="header"></div>, you would write
$("#myDiv").limit({bottom:{at:1, selector:'#footer'}, top:{at:1, selector:'#header'}});
```

for more doc, visit : <a href="http://www.jquery-css.com/magic-jquery">Documentation here</a>
