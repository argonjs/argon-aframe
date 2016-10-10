# argon-aframe

A collection of components, entities and systems to integrate [A-Frame](https://aframe.io) with [argon.js](http://argonjs.io/), so augmented reality content for the Argon web browser can be created with A-Frame.

# A note about using https for development

More and more, modern web browsers demand that you use https:// instead of http://.  You cannot, for example, use the web location APIs, or access video via WebRTC, over http connections on many browsers. If you want to do development using https and node.js use the _devssl_ target (used by doing `npm run devssl`).

# Entities

## AR Scene

An ar-scene is represented by the `<ar-scene>` element, which is used instead of the 
regular `<a-scene>` element. The ar-scene is the global root
object, and all [entities][entity] are contained within the scene.

The scene inherits from the [`Entity`][entity] class so it inherits all of its
properties, its methods, the ability to attach components, and the behavior to
wait for all of its child nodes (e.g., `<a-assets>` and `<a-entity>`) to load
before kicking off the render loop.

It behaves similarly to the `<a-scene>` except that it uses `argon.js` as it's rendering
framework, instead of WebVR.  

Entities within an ar-scene are positioned in Argon's local coordinate frame, which
is arbitrary and can change over time as the user moves.  Therefore, any entity
should be attached to some Argon frame of reference (see the `referenceframe` 
component, and the `<ar-geopose>` and `<ar-frame>` primitives below.)  

### Example

```html
<ar-scene>
  <a-assets>
    <img id="texture" src="texture.png">
  </a-assets>

  <ar-geopose id="GT" lla=" -84.398881 33.778463" userotation="false"> 
      <a-box src="#texture"></a-box>
  </ar-geopose>
</ar-scene>
```

### Properties

| Name          | Description                                                               |
|---------------|---------------------------------------------------------------------------|
| behaviors     | Array of components with tick methods that will be run on every frame.    |
| camera        | Active three.js camera.  Set from argon's camera each frame.           |
| isArgon        | `true` since this is an argon scene.               |
| isScene       | `true` since this is a scene object.  |
| isMobile      | Whether or not environment is detected to be mobile.                      |
| object3D      | [`THREE.Scene`][scene] object.                                            |
| renderer      | Active `THREE.WebGLRenderer`.                                             |
| cssRenderer      | Active `THREE.CSS3DArgonRenderer` (if CSS3DArgonRenderer.js included) |
| hudRenderer      | Active `THREE.CSS3DArgonHUD` (if CSS3DArgonHUD.js included) |
| renderStarted | Whether scene is rendering.                                               |
| argonApp       | The Argon object, non-null when initialized. |
| systems       | Instantiated [systems][systems].                                          |
| time          | Global uptime of scene in seconds.                                        |

### Methods

| Name    | Description                                                                                                            |
|---------|------------------------------------------------------------------------------------------------------------------------|
| reload  | Revert the scene to its original state.                                                                                |

### Events

| Name         | Description                         |
|--------------|-------------------------------------|
| enter-vr     | User has entered the Argon app's stereo viewer mode. |
| exit-vr      | User has exited the Argon app's stereo viewer mode.  |
| loaded       | All nodes have loaded.                             |
| renderstart | Render loop has started.            |
| argon-initialized | Argon has been initialized, including the rendering system |

### Scene Components

Components can be attached to the scene as well as entities:

```html
<ar-scene fog stats>
```

A-Frame ships with a few components to configure the scene, although many of them are not useful 
for  `<ar-scene>` (e.g., keyboard-shortcuts, vr-mode-ui) because they rely on the `<a-scene>`
renderer implementation.  Experimentation will tell you if any particular component works.

AR-specific components are discussesd below.

### Running Content Scripts on the Scene

When running JavaScript on the scene, wait for it to finish loading first:

```js
var scene = document.querySelector('ar-scene');

if (scene.hasLoaded) {
  run();
} else {
  scene.addEventListener('loaded', run);
}

function run () {
  var entity = scene.querySelector('ar-entity');
  entity.setAttribute('material', 'color', 'red');
}
```

# Systems

We define one system, `vuforia`, to manage the Vuforia tracking system.

# Components

## Reference Frame

The `referenceframe` component allows the position and/or orientation of an entity
to be specified using one of Argon's frames of reference.  These reference frames
may be pre-set by the system (e.g., the `ar.user` frame represents the user), defined
by a custom Argon reality, defined on-the-fly by the Vuforia tracking system (for
each of the trackable targets) or defined by the programmer.  

Reference frames are specified using [Cesium Entities](http://cesiumjs.org), with the 
addition that Argon's Entities can be specified in relation to other entities, not just
the `FIXED` and `INERTIAL` reference frames used by Cesium.  Each reference frame
has a name:  `FIXED, `INERTIAL` or the `name` of the Entity.  The typical use of 
a referenceframe component would look like this:

```html
<a-entity referenceframe='parent: ar.user'>
</a-entity>
```

As a convenience, the `referenceframe` component allows a geospatial coordinate to be
specified using longitude and latitude.  Frame's created this way are immediately converted
to Cesium `FIXED` coordinates (which are specified in meters relative to the center of
the earth).  To do this, the `lla` property is set, and the parent is forced to `FIXED`.

```html
<a-entity referenceframe='lla: -84.398881 33.778463'>
</a-entity>
```

If a `referenceframe` component is attached to an entity that is not at the root of 
the `<ar-scene>`, the parent transforms are ignored and the entity is still positioned
as specified by the `referenceframe`.  This allows entities to be grouped together for
semantic or other organizational reasons, but positioned correctly.

### Properties

| Property   | Description                                                                                                                     | Default Value |
|------------|---------------------------------------------------------------------------------------------------------------------------------|---------------|
| parent     | The reference frame that this entity should be positioned relative to. | FIXED          |
| lla        | The logitude, latitude and (optional) altitude of the entity.                                                                                              | ignored unless set |
| userotation | Should the entity rotation be set from this reference frame. | true        |
| useposition | Should the entity position be set from this reference frame. | true        |

## Vuforia Key

The `vuforiakey` component can be added to the `<ar-scene>` entity to specify the Vuforia 
license key, if vuforia is needed.  The property of the component is a reference to a DOM element
that is either a `<a-asset-item>` or some other DOM element.  If it's an asset item, the 
key will be stored in a separate file on the server and the path specified as a property of the 
asset item.  The element is a DOM element, the key will be stored directly in the HTML file.

```html
<ar-scene vuforiakey="#vuforiakey">
      <a-assets>
        <a-asset-item id="vuforiakey" src="key.txt"></a-asset-item>
      </a-assets>
</ar-scene>
```
Specifying a key causes vuforia to be immediately initialized with that key.

### Properties

The `vuforiakey` component takes one property.

| Description                                                                                                                     | Default Value |
|------------|---------------------------------------------------------------------------------------------------------------------------------|---------------|
| The DOM element specifying the key. | A DOM element reference |

### Events

When a key is specified, Argon will attempt to initialize vuforia with the key.  The 
following events may be emitted.

| Name         | Description                         |
|--------------|-------------------------------------|
| argon-vuforia-not-available  | This platform does not support vuforia. |
| argon-vuforia-initialized  | Vuforia successfully initialized with this key. |
| argon-vuforia-initialization-failed  | Vuforia not initialized, see the event.detail.error for why. |

## Vuforia Datasets

The `vuforiadataset` component is added to the `<ar-scene>` entity to specify the location
of a Vuforia dataset.  Argon will attempt to immediately download the dataset (after vuforia
is successfully initialized with the key provided above).

Multiple components can be specified with the multiple component syntax 
(`vuforiadataset__` plus a name).  The name extension (after the `__`) becomes the identity
of that dataset, and is used to create the names of the vuforia targets.  The name extension 
must be lower case. For example, in this example:  

```html
<ar-scene vuforiakey="#vuforiakey"
          vuforiadataset__stonesandchips="src:url(../resources/datasets/StonesAndChips.xml);">
      <a-assets>
        <a-asset-item id="vuforiakey" src="key.txt"></a-asset-item>
      </a-assets>

      <a-entity referenceframe="parent: vuforia.stonesandchips.stones" position="0 0 0" rotation="0 0 0">
         <a-sphere position="0 0 0.05" radius="0.1" color="#EF2D5E" ></a-sphere>
      </a-entity>
</ar-scene>
```

the dataset has the identity `stonesandchips`, and so it's targets are available as 
reference frames `vuforia.stonesandchips.<targetname>` (where, in this dataset, the 
targets are `stones` and `chips`.)  If no dataset name is specified, the name `default_dataset`
is used.

If the `active` property is true, Argon will attempt to load the dataset into the Vuforia
tracking system.

### Properties

| Property   | Description                                                                                                                     | Default Value |
|------------|---------------------------------------------------------------------------------------------------------------------------------|---------------|
| src  | The URL of the dataset. | must be specified |
| active | Is this dataset active. | true |

### Events

When a dataset component is attached to the `<ar-scene>`, Argon will attempt to download it 
and possibly activate it, which will trigger one or more events.

| Name         | Description                         |
|--------------|-------------------------------------|
| argon-vuforia-dataset-downloaded  | Dataset was successfully downloaded. |
| argon-vuforia-dataset-download-failed  | Dataset not downloaded, see the event.detail.error for why. |
| argon-vuforia-dataset-loaded  | The dataset was successfully loaded into Vuforia. event.detail.trackables has an object of trackables for this dataset |
| argon-vuforia-dataset-load-failed  | Dataset not loaded, see the event.detail.error for why. |

## CSS Object

The `<ar-scene>` supports an optional CSS renderer, that has been designed to work with
Argon's stereo viewer mode.  The CSS content is positioned in front of the WebGL content 
(since the web browsers do not allow CSS and WebGL content to be rendered with a shared 
3D depth bufffer).

To add an HTML/CSS element to the 3D scene, the `css-object` component is used.  It takes
one or two CSS DOM references as it's properties, specifying the DOM elements to position in
in 3D.  If only one DOM element is provided, it will be `clone()`ed when Argon displays
the element in stereo (since one DOM element can only be displayed in one place.)  If a second
element is provided, it will be used for the right view in stereo mode.

The CSS elements are sized such at 1 units (1px in this example) is 1 meter, so the elements
will probably have to be scaled appropriately.  Since the web create the visual detail of a 
DOM element based on it's size, with a 100 unit element having ten times the resolution as
a 10 unit element, you should size and scale your DOM elements to balance detail vs rendering 
cost (higher resolution elements yield higher resolution textures and are slower to render).

```css
.boxface {
    opacity: 0.5;
    width: 90px;
    height: 90px;
    font-size: 25px;
    text-align: center;
    color: black;
    background: rgba(127,255,255,0.85);
    outline: 5px solid rgba(12,25,25,1.0);
    border: 0px;
    margin-bottom: 0px;
    padding: 0px 0px;
}
```

```html
    <div hidden>
      <div id="mydiv" class="boxface">Argon<br>+<br>AFrame</div>
      <div id="mydiv2" class="boxface">WebGL<br>+<br>CSS</div>
    </div>
    <ar-scene>
      <a-entity id="helloworld" position="0 -1 -8">
        <a-box position="-1 0.5 1" rotation="0 45 0" width="1" 
               height="1" depth="1"  color="#4CC3D9" ></a-box>
        <a-entity position="0 3 0">
          <a-entity rotation="0 45 0">
                  <a-entity css-object="div: #mydiv" scale="0.01 0.01 0.01" rotation="0 0 0" position="0 0 0.5"></a-entity>
                  <a-entity css-object="div: #mydiv2" scale="0.01 0.01 0.01" rotation="0 -90 0" position="-0.5 0 0"></a-entity>
          </a-entity>
        </a-entity>
      </a-entity>
    </ar-scene>
```

### Properties

| Property   | Description                                                                                                                     | Default Value |
|------------|---------------------------------------------------------------------------------------------------------------------------------|---------------|
| div  | The HTML element reference for the div. | must be specified |
| div2 | The optional element element reference for the right stereo div. | null |

# Custom Realities

The `desiredreality` component is added to the `<ar-scene>` entity to specify that a custom
reality should be used. Argon will attempt to immediately install the custom reality.

The properties of the component specify a name for the reality (that will appear in Argon4's 
reality chooser) and a URL for reality HTML file.  

```html
<ar-scene desiredreality="src:url(../resources/reality/panorama/index.html);">
</ar-scene>
```

Removing the attribute reverts to the default reality for the browser (NOTE: a known bug in argon.js prevents this from working,
it will be fixed soon.)

### Properties

The `desiredreality` component takes two properties.

| Property   | Description                                                                                                                     | Default Value |
|------------|---------------------------------------------------------------------------------------------------------------------------------|---------------|
| src  | The URL of the reality. | must be specified |
| name | A human readable name for this reality. | "default" |

## Panorama Reality

The `panorama` component is added to the `<ar-scene>` entity to specify a geopositioned panoramic image for the custom
panorama reality (the panorama reality implements the "ael.gatech.panorama" reality protocol). 

Multiple components can be specified with the multiple component syntax 
(`panorama__` plus a name).  The name extension (after the `__`) becomes the identity
of that panorama, and is used to show the panorama by emitting a "showpanorama" event on 
the `<ar-scene>`.  For example, in this example:

```html
<ar-scene desiredreality="src:url(../resources/reality/panorama/index.html);"
      panorama__aqui="src:url(/panorama/panoramas/aqui.jpg);lla:-84.3951 33.7634 206;initial:true;">
</ar-scene>
```
the panorama has the identity `aqui`, and so it can be shown in the panoramic reality by emiting an event:
```
var arScene = document.querySelector('ar-scene');
var menu = document.getElementById('menu');

var button = document.createElement('button');
button.textContent = "Aquarium";
menu.appendChild(button);
// when a button is tapped, have the reality fade in the corresponding panorama
button.addEventListener('click', function () {
    arScene.sceneEl.emit('showpanorama', { name: "aqui" });     
});
```

If the `initial` property is true, argon.js will attempt to load the panorama when the 
panorama reality is activated.

### Properties

| Property   | Description                                                                                                                     | Default Value |
|------------|---------------------------------------------------------------------------------------------------------------------------------|---------------|
| src  | The URL of the panoramic image. | must be specified |
| initial | Is this panorama shown as the first panorama. | false |
| lla        | The logitude, latitude and (optional) altitude of the entity. | required |
| offsetdegrees | The yaw orientation offset, to align the panorama with north | 0 |
| easing | Tween.js easing function for transitioning to this panorama | "Quadratic.InOut" |
| duration | duration of the transition in milliseconds | 500 |

## Fixed Size 

A common need in geospatial AR is to size elements (such as labels) a constant size no
matter where in 3D they appear.  The `fixedsize` component does that.  It takes one 
property, representing how big 1m in the entity should be in CSS pixels on the screen.  The object is then scaled to that size each frame taking the distance
from the camera into account.

```html
    <ar-scene>
      <a-assets>
        <img id="buzzpin" src="../resources/textures/buzz-pin.png">
      </a-assets>
      <ar-geopose id="GT" lla=" -84.398881 33.778463" userotation="false"> 
         <a-entity billboard fixedsize="20">
           <a-plane rotation="0 90 0" width="2.9" height="4" src="#buzzpin" transparent="true"></a-plane>
           <a-entity css-object="div: #mydiv" scale="0.02 0.02 0.02" position="0 4 0"></a-entity>
        </a-entity>
      </ar-geopose>
    </ar-scene>
```

In this example, the `#buzzpin` plane would be approximately 80 pixels tall on the screen.

### Properties

| Description                                                                                                                     | Default Value |
|---------------------------------------------------------------------------------------------------------------------------------|---------------|
| The scale applied to the element if it was 1 meter from the camera. | 1 |


## Distance Trigger

A common need in AR and VR is to know when the viewer is within a certain distance of some location in the world. The `trigger` component can be attached to an entity, and when the camera is within a certain distance (specified by the `radius` attribute) the component will emit an event (specified by the `event` attribute).

```html
    <ar-scene>
      <ar-geopose id="GT" lla=" -84.398881 33.778463" userotation="false" trigger="radius:100;event:nearGT"> 
         <a-entity billboard fixedsize="20">
           <a-plane rotation="0 90 0" width="2.9" height="4" src="#buzzpin" transparent="true"></a-plane>
           <a-entity css-object="div: #mydiv" scale="0.02 0.02 0.02" position="0 4 0"></a-entity>
        </a-entity>
      </ar-geopose>
    </ar-scene>
```

In this example, when the user (camera) is within 100 meters of the specified LLA, the event will be emitted.  Similarly, when the user (camera) moves further than 100 meters away, the event will be emitted again.  The event detail can be used to decide if it was an enter or exit event.

Multiple triggers can be attached to an entity.  If `trigger__name` is attached, the event emitted will name `name` in the event detail `name` property.

### Properties

| Property | Description                                                                                                                     | Default Value |
|-----------|----------------------------------------------------------------------------------------------------------------------|---------------|
|raduis|The distance of the trigger point from the entity to the camera. | 1 |
|event| The name of the event to emit.| "trigger" |

### Events

When a trigger is fired, it will emit the following event.

| Name         | Description                         |
|--------------|-------------------------------------|
| `eventname`  | A trigger event containing event detail {name: string, inside: boolean, distanceSquared: number} | 

## Visibility Tracking

Argon's reference frames can be defined or undefined over time.  For example, a visual target 
being tracked by Vuforia will become lost if the user is not pointing the camera at the the 
target.  Similarly, until Argon receives the first GPS report, the `ar.user` reference frame 
is undefined.

The `trackvisibility` component will set the `object3D.visible` property based on the 
status of the reference frame used by the scene.  If the entity does not have a `referenceframe` 
compoent, this component does nothing.

The component has one property, a boolean, that enables or disables it.  If the property is 
enabled, it sets/resets the `object3D.visible` property as the status of the reference frame
changes, otherwise it does nothing.  

A common use would be to have the entity and it's children only be visible when the 
reference frame it is attached to is known.  We can modify the vuforia snippet above to
behave this way by adding a `trackvisibility` component, and initializing it's `visible` 
component to false.

```html
<ar-scene vuforiakey="#vuforiakey"
          vuforiadataset__stonesandchips="src:url(../resources/datasets/StonesAndChips.xml);">
      <a-assets>
        <a-asset-item id="vuforiakey" src="key.txt"></a-asset-item>
      </a-assets>

      <ar-frame id="frame" trackvisibility="true" visible="false" 
                parent="vuforia.stonesandchips.stones" position="0 0 0" rotation="0 0 0">
         <a-sphere position="0 0 0.05" radius="0.1" color="#EF2D5E" ></a-sphere>
      </ar-frame>
</ar-scene>
```

### Properties

| Description                                                                                                                     | Default Value |
|---------------------------------------------------------------------------------------------------------------------------------|---------------|
| If this component is active or not, and changes the object3D.visible value. | true |

# Primitives

We define a set of primitives for some common AR use cases.

## AR Camera

An Argon-specific camera is created with the `<ar-camera>` tag.  If one is not in your 
scene, one will be created for you.  The camera entity has a `camera` component on it, as 
well as a `referenceframe="parent: ar.user"` component to attach the component to the
user's reference frame.  If you would like content to be positioned relative to the 
user and move with them, you should make it a child of this entity.

## Geopose

The `<ar-geopose>` primitive creates an entity with a `referenceframe` component that 
defines the position and/or rotation of the entity by an LLA (longitude, lattitude, altitude).  
The `userotation` and `useposition` properties can be set to true (the default) to have
this entity set it's rotation and/or position from the referenceframe.  Often, the position
is used but the rotation may be left to be specified in the local coordinates.

## Frame of Reference

The `<ar-frame>` primitive creates an entity with a `referenceframe` component that 
defines the position and/or rotation of the entity relative to some know Argon frame of
reference.  `ar.user` is a frame that represents the user (other frames may be added
in the future).  The Vuforia tracker specifies other frames of reference that may be used.
The `userotation` and `useposition` properties can be set to true (the default) to have
this entity set it's rotation and/or position from the referenceframe.  