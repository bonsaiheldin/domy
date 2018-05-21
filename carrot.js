/**
 * @author       Bonsaiheldin <dm@bonsaiheld.org> (http://bonsaiheld.org/)
 * @copyright    2018 Bonsaiheldin
 * @license      {@link https://github.com/bonsaiheldin/carrotjs/blob/master/LICENSE.md|MIT License}
 */

/** Initialize the main object with all expected properties
 *
 * @class Carrot
 * @static
 */
var Carrot = Carrot ||
{
    "Version": "0.0.7",
    /*
    "Game": {},
    "Camera": {},
    "World": {},
    "Group": {},
    "Sprite": {},
    "Time": {},
    "Math": {},
    "Sound": {},
    "Physics": {},
    "Point": {},
    "Rectangle": {},
    "Circle": {},
    "Line": {},
    "Input": {}
    */
};

console.log("%CarrotJS v" + Carrot.Version + " | HTML5 DOM game engine | https://github.com/bonsaiheldin/carrotjs", "font-weight: bold;");

/**
 * The core game object. Starts the game.
 *
 * @class Carrot.Game
 * @constructor
 * @param {number} [width=800] - The width of the container.
 * @param {number} [height=600] - The height of the container.
 * @param {string} [parent=null] - The parent div of the container.
 * @param {object} [states=null] - Custom states the game shall use.
 * @param {boolean} [transparent=false] - Defines if the container shall be transparent.
 */
Carrot.Game = function(width, height, parent, states, transparent)
{
    let that = this;
    let start = function()
    {
        that.width = width || 800;
        that.height = height || 600;
        that.parent = document.getElementById(parent) || null;
        that.states = states || null;
        that.transparent = transparent || false;

        // If container was not specified or not found, create one
        if (that.parent === null)
        {
            let backgroundDiv = document.createElement('div');
            document.body.appendChild(backgroundDiv);
            backgroundDiv.style.position = "relative";
            that.background = backgroundDiv;

            let div = document.createElement('div');
            backgroundDiv.appendChild(div);
            div.style.position = "absolute";
            that.parent = div;
        }

        else
        {
            let backgroundDiv = document.createElement('div');
            backgroundDiv.style.position = "relative";
            that.parent.appendChild(backgroundDiv);
            that.background = that.parent;
            that.parent = backgroundDiv;
        }

        // If the container shall not be transparent, color it black
        if (that.transparent === false)
        {
            that.background.style.backgroundColor = '#000000';
        }

        that.background.style.width = that.width + 'px';
        that.background.style.height = that.height + 'px';
        that.background.style.overflow = "hidden";
        that.parent.className = 'carrotjs';

        // Init modules
        that.physics  = new Carrot.Physics(that);
        that.world    = new Carrot.World(that);
        that.camera   = new Carrot.Camera(that);
        that.time     = new Carrot.Time(that);
        that.cache    = new Carrot.Cache(that);
        that.load     = new Carrot.AssetLoader(that);
        that.add      = new Carrot.ObjectFactory(that);
        that.sound    = new Carrot.SoundManager(that);
        that.keyboard = new Carrot.Keyboard(that);
        that.mouse    = new Carrot.Mouse(that);

        // Run the given preload state, if available.
        if (that.states !== null)
        {
            if (that.states.preload)
            {
                that.states.preload();
            }
        }

        return that;
    };

    document.addEventListener('DOMContentLoaded', start, false);
}

Carrot.Game.prototype =
{
    /**
     * The update loop of the core. Happens automatically.
     * @method Carrot.Game#_update
     * @private
     */
    _update(delta)
    {
        this.time._update(delta);
        this.world._update();
        //this.camera._update();

        // Run the given update state, if available.
        if (this.states !== null)
        {
            if (this.states.update)
            {
                this.states.update();
            }
        }
    },

    /**
     * The render loop of the core. Happens automatically.
     * @method Carrot.Game#_render
     * @private
     */
    _render()
    {
        this.world._render();
        //this.camera._render();

        // Run the given render state, if available.
        if (this.states !== null)
        {
            if (this.states.render)
            {
                this.states.render();
            }
        }
    },

    /**
     * Starts the update and the render loops of the core.
     * @method Carrot.Game#_render
     * @private
     */
    start(game)
    {
        // Start the two core loops
        MainLoop.setUpdate(function(delta)
        {
            game._update(delta);
        }).setDraw(function()
        {
            game._render();
        }).start();

        // Run the given create state, if available.
        if (this.states !== null)
        {
            if (this.states.create)
            {
                this.states.create();
            }
        }
    }
};

Carrot.Game.prototype.constructor = Carrot.Game;

/**
 * The world container stores every sprite or group and updates them automatically.
 *
 * @class Carrot.World
 * @constructor
 * @param {Carrot.Game} game - The core game object.
 */
Carrot.World = function(game)
{
    this.game = game;
    this.camera = new Carrot.Camera(this.game);
    this.x = 0;
    this.y = 0;
    this.width = this.game.width;
    this.height = this.game.height;
    this.bounds = new Carrot.Rectangle(this.x, this.y, this.width, this.height);

    this.children = [];

    return this;
};

Carrot.World.prototype =
{
    /**
     * Adds a child to the world container. The child can be a sprite or a group.
     * @method Carrot.World#addChild
     * @param {object} entity - The child.
     */
    addChild(entity)
    {
        this.children.push(entity);
    },

    /**
     * Removes the given child from the world container.
     * @method Carrot.World#removeChild
     * @param {object} entity - The child.
     */
    removeChild(entity)
    {
        this.children.splice(this.children.indexOf(entity), 1);
    },

    /**
     * The update loop of the world container. Happens automatically.
     * @method Carrot.World#_update
     * @private
     */
    _update()
    {
        for (let i = 0; i < this.children.length; i++)
        {
            let child = this.children[i];

            child._update();
        }
    },

    /**
     * The render loop of the world container. Happens automatically.
     * @method Carrot.World#_render
     * @private
     */
    _render()
    {
        for (let i = 0; i < this.children.length; i++)
        {
            let child = this.children[i];

            child._render();
        }
    }
};

Carrot.World.prototype.constructor = Carrot.World;

/**
 * The camera. It is added to the core loops and updates automatically.
 *
 * @class Carrot.Camera
 * @constructor
 * @param {Carrot.Game} game - The core game object.
 */
Carrot.Camera = function(game)
{
    this.game = game;
    this.world = this.game.world;
    /**
    * @property {number} x - The x coordinate of the camera.
    */
    this.x = 0;
    this.y = 0;
    this.width = this.game.width;
    this.height = this.game.height;
    this.bounds = new Carrot.Rectangle(this.x, this.y, this.width, this.height);
    this.left   = this.x;
    this.right  = this.x + this.width;
    this.top    = this.y;
    this.bottom = this.y + this.height;

    // Internal values
    this._x = this.x;
    this._y = this.y;

    this.target = null;

    return this;
};

Carrot.Camera.prototype =
{
    /**
     * Let the camera follow an entity.
     * @method Carrot.Camera#follow
     * @param {object} game - The entity.
     */
    follow(target)
    {
        if (target)
        {
            this.target = target;
        }
    },

    /**
     * Let the camera stop following any entity.
     * @method Carrot.Camera#unfollow
     */
    unfollow()
    {
        this.target = null;
    },

    /**
     * The update loop of the camera. Happens automatically.
     * @method Carrot.Camera#_update
     * @private
     */
    _update()
    {
        if (this.target !== null)
        {
            let targetX = this.target.x;
            let targetY = this.target.y;

            // Left / right
            if (targetX > this.width * 0.5
             && targetX <= this.world.width - (this.width * 0.5))
            {
                this._x = targetX - (this.width * 0.5);
            }

            // Top / bottom
            if (targetY > this.height * 0.5
             && targetY <= this.world.height - (this.height * 0.5))
            {
                this._y = targetY - (this.height * 0.5);
            }
        }

        // Update internal values
        this.left   = this.x;
        this.right  = this.x + this.width;
        this.top    = this.y;
        this.bottom = this.y + this.height;
    },

    /**
     * The render loop of the camera. Happens automatically.
     * @method Carrot.Camera#_render
     * @private
     */
    _render()
    {
        // Transform the game div according to the camera
        if (this.x !== this._x || this.y !== this._y)
        {
            this.x = this._x;
            this.y = this._y;

            this.game.parent.style.left = -this.x + "px";
            this.game.parent.style.top  = -this.y + "px";
        }
    }
};

Carrot.Camera.prototype.constructor = Carrot.Camera;

/**
 * Groups are containers storing game objects (sprites). They are added automatically to the world container.
 *
 * @class Carrot.Group
 * @constructor
 * @param {Carrot.Game} game - The core game object.
 */
Carrot.Group = function(game)
{
    this.game = game;
    this.world = this.game.world;

    // Internal values
    this.type = Carrot.GROUP;
    this.children = [];
    this.length = this.children.length;

    // Add it to the world
    this.world.addChild(this);

    return this;
};

Carrot.Group.prototype =
{
    /**
     * Adds an entity to a group. The entity has to be a sprite.
     *
     * @method Carrot.Group#addChild
     * @param {object} entity - The entity.
     */
    addChild(entity)
    {
        this.children.push(entity);
        entity.group = this; // Update the sprite's reference to the group.

        // Update child counter
        this.length = this.children.length;

        // Since the entity is now in the group, there is no need for it to be
        // a child of the world, because it gets updated through the group now.
        this.world.removeChild(entity);
    },

    /**
     * Removes the given entity from a group.
     *
     * @method Carrot.Group#removeChild
     * @param {object} entity - The entity.
     */
    removeChild(entity)
    {
        this.children.splice(this.children.indexOf(entity), 1);
        entity.group = null; // Update the sprite's reference to the group.

        // Update child counter
        this.length = this.children.length;

        // Since the entity left the group, it has to be added as a child of
        // the world again, so it still gets updates.
        this.world.addChild(entity);
    },

    /**
     * Iterates all children of the group and sets their `property` to the given `value`.
     *
     * @method Carrot.Group#setAll
     * @param {string} property - The property to change.
     * @param {any} value - The new value for the property.
     */
    setAll(property, value)
    {
        property = property.split('.');

        for (let i = 0; i < this.children.length; i++)
        {
            let child = this.children[i];

            let key1 = property[0];
            let key2 = property[1];
            let key3 = property[2];

            if (child[key1])
            {
                if (child[key2])
                {
                    if (child[key3])
                    {
                        child[key1][key2][key3] = value;
                    }
                    else
                    {
                        child[key1][key2] = value;
                    }
                }
                else
                {
                    child[key1] = value;
                }
            }
        }
    },

    /**
     * Destroys the sprite and removes it entirely from the game world.
     *
     * @method Carrot.Group#destroy
     */
    destroy()
    {
        // Remove from world container
        this.world.removeChild(this);
    },

    /**
     * The update loop of the group. Happens automatically.
     * @method Carrot.Group#_update
     * @private
     */
    _update()
    {
        for (let i = 0; i < this.children.length; i++)
        {
            let child = this.children[i];

            child._update();
        }
    },

    /**
     * The render loop of the group. Happens automatically.
     * @method Carrot.Group#_render
     * @private
     */
    _render()
    {
        for (let i = 0; i < this.children.length; i++)
        {
            let child = this.children[i];

            child._render();
        }
    }
};

Carrot.Group.prototype.constructor = Carrot.Group;

/**
 * Sprites are game objects which contain the actual HTML elements for rendering.
 *
 * @class Carrot.Sprite
 * @constructor
 * @param {Carrot.Game} game - The core game object.
 * @param {number} [x=0] - The x coordinate in the world of the sprite.
 * @param {number} [y=0] - The y coordinate in the world of the sprite.
 * @param {string} [key=null] - This is the image for the sprite. If left empty, the sprite will be just a green rectangle.
 * @param {string} [frame=0] - The starting frame of the image (only for spritesheets). If left empty, it will be null.
 * @param {Carrot.Group} [group=null] - The group this sprite shall be added to. If left empty, it will be added directly to the world container
 */
Carrot.Sprite = function(game, x, y, key, frame, group)
{
    this.x = x || 0;
    this.y = y || 0;
    this.key = key || null;
    this.frame = frame || 0;
    this.group = group || null;

    this.name = "Unknown sprite";

    // Internal values
    this.type = Carrot.SPRITE;
    this.game = game;
    this.world = this.game.world;
    this.camera = this.game.camera;
    this.time = this.game.time;
    this.alpha = 1;
    this.width = 32;
    this.height = 32;
    this.anchor = new Carrot.Point(0, 0);
    this.left   = this.x - (this.width * this.anchor.x);
    this.right  = this.left + this.width;
    this.top    = this.y - (this.height * this.anchor.y);
    this.bottom = this.top + this.height;
    this.outOfBoundsKill = false;
    this.inCamera = false;
    this.css = {}; // This object stores all data relevant to CSS rendering.
    this.css.transform = ''; // String to collect CSS transforms for this sprite.

    // Physics body
    this.body = new Carrot.Physics.Body(this);

    // HTML magic
    this.image = document.createElement('div');
    this.game.parent.appendChild(this.image);
    this.image.style.position = "absolute";
    this.image.style.width = this.width + "px";
    this.image.style.height = this.height + "px";

    // If no image was given, just color it green
    if (this.key === null)
    {
        //this.image.style.backgroundColor = "#00ff00";
        this.image.style.boxShadow = "inset 0px 0px 0px 1px #00ff00";
    }

    // If an image was given, apply it as a background image
    else
    {
        this.width  = this.game.cache.images[this.key].width;
        this.height = this.game.cache.images[this.key].height;
        this.image.style.backgroundImage = "url(" + this.game.cache.images[this.key].src + ")";

        // Apply frame on spritesheet
        if (this.frame !== 0)
        {
            this.width  = this.game.cache.images[this.key].width;
            this.height = this.game.cache.images[this.key].height;
            let frame = this.game.cache.images[this.key].frames[this.frame];
            this.image.style.backgroundPosition = frame.x + "px " + frame.y + "px";
        }
    }

    // Add it to the world
    // If a group was given, add the sprite to that
    if (this.group !== null) { this.group.addChild(this); }
    // If no group was given, add the sprite to the world container
    else { this.world.addChild(this); }

    return this;
};

Carrot.Sprite.prototype =
{
    /**
     * Kills the sprite. Just a placeholder for now. Later it will be used as a soft destroy for object pooling.
     *
     * @method Carrot.Sprite#kill
     */
    kill()
    {
        this.destroy();
    },

    /**
     * Destroys the sprite and removes it entirely from the game world.
     *
     * @method Carrot.Sprite#destroy
     */
    destroy()
    {
        // If in group, remove it there
        if (this.group !== null)
        {
            this.group.removeChild(this);
        }
        // If not in group, remove it from world container
        else
        {
            this.world.removeChild(this);
        }

        // Remove the HTML element
        this.game.parent.removeChild(this.image);
    },

    /**
     * Changes the width of the sprite.
     *
     * @method Carrot.Sprite#setWidth
     * @param {number} [width=0]
     */
    setWidth(width)
    {
        this.width = width || 0;
        this.image.style.width = value + "px";
    },

    /**
     * Changes the height of the sprite.
     *
     * @method Carrot.Sprite#setHeight
     * @param {number} [height=0]
     */
    setHeight(height)
    {
        this.height = height || 0;
        this.image.style.height = value + "px";
    },

    /**
     * Changes the frame shown. Only for spritesheets.
     *
     * @method Carrot.Sprite#setFrame
     * @param {number} [frame=0]
     */
    setFrame(frame)
    {
        frame = frame || 0;
        frame = this.game.cache.images[this.key].frames[frame];
        this.image.style.backgroundPosition = frame.x + "px " + frame.y + "px";
    },

    /**
     * Applies a glow effect on the sprite. Its shape is determined by the sprite's body and can be a rectangle or a circle.
     *
     * @method Carrot.Sprite#setGlow
     * @param {number} [blur=0] - Blur in pixels.
     * @param {number} [spread=0] - Spread in pixels.
     * @param {Carrot.Color | string} [color="#00ff00"] - The color of the glow. Must be given in one of the following formats: Hexadecimal, RGB, RGBA, HSL, HSLA or one of the 140 predefined browser colors.
     * @param {boolean} [inset=null] - Defines if the glow should be go out or inside the sprite.
     */
     setGlow(blur, spread, color, inset)
     {
         if (blur !== false)
         {
             blur   = blur || 0;
             blur   = blur + "px ";
             spread = spread || 0;
             spread = spread + "px ";
             color = color || "#00ff00 ";
             if (inset) { inset = " inset"; }
                   else { inset = ""; }

             this.image.style.boxShadow = "0px 0px " + blur + spread + color + inset;
         }

         // If the first parameter is false or not given, disable the glow.
         if (blur === false || blur === undefined)
         {
             this.image.style.boxShadow = "";
         }
     },


    /**
     * The update loop of the sprite. Happens automatically.
     * @method Carrot.Sprite#_update
     * @private
     */
    _update()
    {
        // Store some variables for faster accessing
        let thisWidth    = this.width  * this.anchor.x;
        let thisHeight   = this.height * this.anchor.y;
        let worldWidth   = this.world.width;
        let worldHeight  = this.world.height;

        // Check if inside camera bounds
        this.inCamera = false;

        if (this.right  >= this.camera.left
         && this.bottom >= this.camera.top
         && this.left   <= this.camera.right
         && this.top    <= this.camera.bottom)
        {
            this.inCamera = true;
        }

        // Remove unnecessary css when outside camera. Should improve performance.
        if (this.inCamera === false)
        {
            this.image.style.width   = "";
            this.image.style.height  = "";
            this.image.style.opacity = "";
            if (this.key !== null)
            {
                this.image.style.backgroundImage = "";
            }
        }

        else
        {
            this.image.style.width   = this.width + "px";
            this.image.style.height  = this.height + "px";
            this.image.style.opacity = this.alpha;
            if (this.key !== null)
            {
                this.image.style.backgroundImage = "url(" + this.game.cache.images[this.key].src + ")";
            }
        }

        // Physics
        if (this.body !== null)
        {
            // Physics enabled on this body?
            if (this.body.enabled)
            {
                // Reset body.touching
                this.body.touching.none   = true;
                this.body.touching.left   = false;
                this.body.touching.right  = false;
                this.body.touching.top    = false;
                this.body.touching.bottom = false;

                // Acceleration
                if (this.body.allowAcceleration)
                {
                    this.body.velocity.x += this.body.acceleration.x * this.time.delta;
                    this.body.velocity.y += this.body.acceleration.y * this.time.delta;
                }

                // Gravity
                if (this.body.allowGravity)
                {
                    this.body.velocity.x += this.body.gravity.x;
                    this.body.velocity.y += this.body.gravity.y;
                }

                // Drag: Deceleration
                if (this.body.allowDrag)
                {
                    this.body.velocity.x *= (1 - this.body.drag.x);
                    this.body.velocity.y *= (1 - this.body.drag.y);
                }

                // Moving
                this.x += this.body.velocity.x * this.time.delta;
                this.y += this.body.velocity.y * this.time.delta;

                // Let the sprite collide with the world bounds
                if (this.body.collideWorldBounds)
                {
                    // Left, right, top, bottom
                    if (this.x <= thisWidth)
                    {
                        this.x = thisWidth;

                        this.body.touching.none = false;
                        this.body.touching.left = true;

                        // Bouncing
                        if (this.body.allowBounce)
                        {
                            this.body.velocity.x = -(this.body.velocity.x * this.body.bounce.x);
                        }
                    }

                    if (this.x + thisWidth >= worldWidth)
                    {
                        this.x = worldWidth - thisWidth;

                        this.body.touching.none = false;
                        this.body.touching.right = true;

                        // Bouncing
                        if (this.body.allowBounce)
                        {
                            this.body.velocity.x = -(this.body.velocity.x * this.body.bounce.x);
                        }
                    }

                    if (this.y <= thisHeight)
                    {
                        this.y = thisHeight;

                        this.body.touching.none = false;
                        this.body.touching.top = true;

                        // Bouncing
                        if (this.body.allowBounce)
                        {
                            this.body.velocity.y = -(this.body.velocity.y * this.body.bounce.y);
                        }
                    }

                    if (this.y + thisHeight >= worldHeight)
                    {
                        this.y = worldHeight - thisHeight;

                        this.body.touching.none = false;
                        this.body.touching.bottom = true;

                        // Bouncing
                        if (this.body.allowBounce)
                        {
                            this.body.velocity.y = -(this.body.velocity.y * this.body.bounce.y);
                        }
                    }
                }
            }
        }

        // Kill the sprite if it leaves the world bounds
        // >>>>>>>>>>>>>>>>>>>>> Bug! <<<<<<<<<<<<<<<<<<
        if (this.outOfBoundsKill)
        {
            // Left, right, top, bottom
            if (this.x < thisWidth
             || this.x > worldWidth  + thisWidth
             || this.y < thisHeight
             || this.y > worldHeight + thisHeight)
            {
                //this.kill();
            }
        }

        // Update some internal stuff
        this.left   = this.x - (this.width  * this.anchor.x);
        this.right  = this.left + this.width;
        this.top    = this.y - (this.height * this.anchor.y);
        this.bottom = this.top + this.height;

        // Collect all transforms and apply them in the render function
        this.css.transform = "";
        let x = Math.round(this.x - thisWidth);
        let y = Math.round(this.y - thisHeight);
        this.css.transform += "translate(" + x + "px," + y + "px)";
    },

    /**
     * The render loop of the sprite. Happens automatically.
     * @method Carrot.Sprite#_render
     * @private
     */
    _render()
    {
        this.image.style.transform = this.css.transform;
    }
};

Carrot.Sprite.prototype.constructor = Carrot.Sprite;

/**
 * The Time container stores the current time, the time the game has started at and the delta time for animating.
 *
 * @class Carrot.Time
 * @constructor
 * @param {Carrot.Game} game - The core game object.
 */
Carrot.Time = function(game)
{
    this.game = game;

    this.started = Date.now();
    this.sinceStart = 0;
    this.now = Date.now();

    return this;
};

Carrot.Time.prototype =
{
    /**
     * The update loop of the time object. Happens automatically.
     * @method Carrot.Time#_update
     * @private
     */
    _update(delta)
    {
        this.sinceStart = Date.now() - this.started;
        this.now = Date.now();
        this.delta = delta / 1000;
    }
};

Carrot.Time.prototype.constructor = Carrot.Time;

/**
 * The Math object offers various standard math functions like measuring a distance.
 *
 * @class Carrot.Math
 * @static
 */
Carrot.Math = {

    /**
    * PI.
    * @property {number} Carrot.Math#PI
    * @type {number}
    */
    PI: Math.PI,

    /**
    * Twice PI.
    * @property {number} Carrot.Math#PI2
    * @type {number}
    */
    PI2: Math.PI * 2,

    /**
    * Degrees to Radians factor.
    * @property {number} Carrot.Math#DEG_TO_RAD
    */
    DEG_TO_RAD: Math.PI / 180,

    /**
    * Degrees to Radians factor.
    * @property {number} Carrot.Math#RAD_TO_DEG
    */
    RAD_TO_DEG: 180 / Math.PI,

    /**
    * Convert degrees to radians.
    *
    * @method Carrot.Math#degToRad
    * @param {number} degrees - Angle in degrees.
    * @return {number} Angle in radians.
    */
    degToRad(degrees)
    {
        return degrees * Carrot.Math.DEG_TO_RAD;
    },

    /**
    * Convert radians to degrees.
    *
    * @method Carrot.Math#radToDeg
    * @param {number} radians - Angle in radians.
    * @return {number} Angle in degrees.
    */
    radToDeg(radians)
    {
        return radians * Carrot.Math.RAD_TO_DEG;
    },

    /**
    * Returns an integer between (including) min and (including) max
    *
    * @method Carrot.Math#integerInRange
    * @param {number} min - Min.
    * @param {number} max - Max.
    * @return {number}
    */
    integerInRange(min, max)
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /** Returns the direction between two poins in degrees */
    angleBetweenPoints(x1, y1, x2, y2)
    {
        return Math.atan2(y2 - y1, x2 - x1) * Carrot.Math.RAD_TO_DEG;
    },

    /** Returns the distance between two vectors */
    distanceBetweenPoints(x1, y1, x2, y2)
    {
        return Math.hypot(x2 - x1, y2 - y1);
    }
};

/**
 * The Sound Manager offers audio functions.
 *
 * @class Carrot.SoundManager
 * @constructor
 * @param {Carrot.Game} game - The global game object.
 */
Carrot.SoundManager = function(game)
{
    this.game = game;

    return this;
};

Carrot.SoundManager.prototype =
{
    /**
     * Plays an audio file that has been loaded before by the {Carrot.AssetLoader};
     * @method Carrot.SoundManager#play
     * @private
     */
    play(file, loop)
    {
        var file = Carrot.Sounds[file];
        if (! file.paused)
        {
            file.pause();
            file.currentTime = 0;
            file.play();
        }

        else
        {
            file.play();
        }

        // Music?
        if (loop !== undefined)
        {
            file.loop = loop;
        }
    }
};

Carrot.SoundManager.prototype.constructor = Carrot.SoundManager;

// Physics

/**
 * The Physics object offers physics related functions like collision detection.
 *
 * @class Carrot.Physics
 * @constructor
 * @param {Carrot.Game} game - The core game object.
 */
Carrot.Physics = function(game)
{
    this.game = game;
}

Carrot.Physics.prototype =
{
    /**
    * Checks for collision between entities which can be sprites or groups.
    *
    * @method Carrot.Physics#collide
    * @param {Carrot.Group | Carrot.Sprite} entity1
    * @param {Carrot.Group | Carrot.Sprite} entity2
    * @param {function} [callback=null] - The function that shall be executed when the collision happens.
    */
    collide(entity1, entity2, callback)
    {
        if (entity1.type === Carrot.SPRITE)
        {
            if (entity2.type === Carrot.SPRITE)
            {
                //this.collideSpriteVsSprite(entity1, entity2, callback);
            }

            else if (entity2.type === Carrot.GROUP)
            {
                //this.collideSpriteVsGroup(entity1, entity2, callback);
            }
        }

        else if (entity1.type === Carrot.GROUP)
        {
            if (entity2.type === Carrot.SPRITE)
            {
                this.collideSpriteVsGroup(entity2, entity1, callback);
            }
        }
    },

    /**
    * Checks for overlapping between entities which can be sprites or groups.
    *
    * @method Carrot.Physics#collide
    * @param {Carrot.Group | Carrot.Sprite} entity1
    * @param {Carrot.Group | Carrot.Sprite} entity2
    * @param {function} [callback=null] - The function that shall be executed when the overlapping happens.
    */
    overlap(entity1, entity2, callback)
    {
        if (entity1.type === Carrot.SPRITE)
        {
            if (entity2.type === Carrot.SPRITE)
            {
                //this.collideSpriteVsSprite(entity1, entity2, callback, true);
            }

            else if (entity2.type === Carrot.GROUP)
            {
                //this.collideSpriteVsGroup(entity1, entity2, callback, true);
            }
        }

        else if (entity1.type === Carrot.GROUP)
        {
            if (entity2.type === Carrot.SPRITE)
            {
                this.collideSpriteVsGroup(entity2, entity1, callback, true);
            }
        }
    },

    /**
    * Checks for collision between groups. Use collide or overlap instead.
    *
    * @method Carrot.Physics#collide
    * @param {Carrot.Group} group1
    * @param {Carrot.Group} group2
    * @param {function} [callback=null] - The function that shall be executed when the collision or overlapping happens.
    * @param {boolean} [overlapOnly=false] - Defines if the function shall only check for overlapping and disable physics.
    * @private
    */
    collideGroupVsGroup(group1, group2, callback, overlapOnly)
    {
        for (let i = 0; i < group1.children.length; i++)
        {
            let a = group1.children[i];
            for (let j = 0; j < group2.children.length; j++)
            {
                let b = group2.children[j];
                if (b !== a)
                {
                    if (this.intersectRectangles(a, b))
                    {
                        if (! overlapOnly)
                        {
                            // Coming from the left.
                            if (a.body.velocity.x > 2)
                            {
                                a.x = b.left - a.width - 1;
                            }

                            // Coming from the right.
                            else if (a.body.velocity.x < 0)
                            {
                                a.x = b.right + 2;
                            }

                            // Coming from the top.
                            else if (a.body.velocity.y > 0)
                            {
                                a.y = b.top - a.height - 2;
                            }

                            // Coming from the bottom.
                            else if (a.body.velocity.y < 0)
                            {
                                a.y = b.bottom + 2;
                            }
                        }

                        // If a callback was given, fire it.
                        if (callback !== null && callback !== undefined)
                        {
                            callback(a, b);
                        }
                    }
                }
            }
        }
    },

/*
    var rect1 = {x: 5, y: 5, width: 50, height: 50}
    var rect2 = {x: 20, y: 10, width: 10, height: 10}

    if (rect1.x < rect2.x + rect2.width &&
       rect1.x + rect1.width > rect2.x &&
       rect1.y < rect2.y + rect2.height &&
       rect1.height + rect1.y > rect2.y) {
        // collision detected!
    }
    */

    /**
    * Checks for intersection between two rectangles.
    *
    * @method Carrot.Physics#intersectRectangles
    * @param {Carrot.Rectangle} a
    * @param {Carrot.Rectangle} b
    * @private
    */
    intersectRectangles(a, b)
    {
        if (a.right <= b.x)
        {
            return false;
        }

        if (a.bottom <= b.y)
        {
            return false;
        }

        if (a.x >= b.right)
        {
            return false;
        }

        if (a.y >= b.bottom)
        {
            return false;
        }

        return true;
        /*
        return (a.left   < b.right
             && a.right  > b.left
             && a.top    < b.bottom
             && a.bottom > b.top);
             */
    },

    /**
    * Checks for intersection between two circles.
    *
    * @method Carrot.Physics#intersectRectangles
    * @param {Carrot.Circle} a
    * @param {Carrot.Circle} b
    * @private
    */
    intersectCircles(a, b)
    {
        let x = a.x - b.x;
        let y = a.y - b.y;
        let r = (a.width * 0.5) + (b.width * 0.5);
        return (x * x) + (y * y) < (r * r);
    }
};

Carrot.Physics.prototype.constructor = Carrot.Physics;

/**
 * Creates a physics body.
 *
 * @class Carrot.Physics.Body
 * @constructor
 * @param {Carrot.Game} game - The core game object.
 * @param {number} x - X position relative to the sprite.
 * @param {number} y - Y position relative the sprite.
 */
Carrot.Physics.Body = function(parent, x, y)
{
    this.parent = parent;
    this.x = x || 0;
    this.y = y || 0;

    this.velocity     = new Carrot.Point(0, 0);
    this.bounce       = new Carrot.Point(0, 0);
    this.drag         = new Carrot.Point(0, 0);
    this.gravity      = new Carrot.Point(0, 0);
    this.acceleration = new Carrot.Point(0, 0);

    this.allowBounce       = true;
    this.allowDrag         = true;
    this.allowGravity      = true;
    this.allowAcceleration = true;

    this.touching =
    {
        none:   true,
        left:   false,
        right:  false,
        top:    false,
        bottom: false
    };

    this.collideWorldBounds = false;

    this.isRectangle = true;
    this.isCircle = false;
    this.enabled = true;

    return this;
};

Carrot.Physics.Body.prototype =
{
    /**
    * Changes the shape of the body and its parent sprite into a circle.
    *
    * @method Carrot.Physics#setCircle
    */
    setCircle()
    {
        this.isRectangle = false;
        this.isCircle = true;

        this.sprite.image.style.borderRadius = (this.sprite.width * 0.5) + "px";
    },

    /**
    * Changes the shape of the body and its parent sprite into a rectangle.
    *
    * @method Carrot.Physics#setRectangle.
    */
    setRectangle()
    {
        this.isRectangle = true;
        this.isCircle = false;

        this.sprite.image.style.borderRadius = "";
    }
};

Carrot.Physics.Body.prototype.constructor = Carrot.Physics.Body;

/**
 * This class stores images, sounds and custom CSS classes.
 *
 * @class Carrot.Cache
 * @constructor
 * @param {Carrot.Game} game - The core game object.
 */
Carrot.Cache = function(game)
{
    this.game = game;

    this.images = {};
    this.sounds = {};
    this.classes = {};
};

Carrot.Cache.prototype =
{

};

Carrot.Cache.prototype.constructor = Carrot.Cache;

/**
 * This class allows for creating ingame stylesheets.
 *
 * @class Carrot.Class
 * @constructor
 * @param {Carrot.Game} game - The core game object.
 */
Carrot.Class = function(game, name, css)
{
    this.game = game;

    this.name = name;
    this.css = css || {};

    return this;
};

Carrot.Class.prototype =
{
    /**
     * Adds a new CSS rule to the class.
     *
     * @method Carrot.Class#add
     * @param {string} name - The unique name of the class.
     * @param {object} [style=null] - The style of the class. Default: null.
     */
    add(name, style)
    {
        if (name)
        {
            style = style || null;
            if (style !== null)
            {
                this.game.cache.classes[name] = style;
            }

            else
            {
                this.game.cache.classes[name] = {};
            }
        }
    },

    /**
     * Removes an existing CSS rule from the class.
     *
     * @method Carrot.Class#remove
     * @param {string} name - The unique name of the class.
     */
    remove(name)
    {
        delete this.game.cache.classes[name];
    },

    /**
     * Edits an existing CSS rule of the class.
     *
     * @method Carrot.Class#add
     * @param {string} name - The unique name of the class.
     * @param {string} key
     * @param {string} value
     */
    edit(name, key, value)
    {
        let customClass = this.game.cache.classes[name];
        if (customClass)
        {
        }
    },
};

Carrot.Class.prototype.constructor = Carrot.Class;

/**
 * Creates a point.
 *
 * @class Carrot.Point
 * @constructor
 * @param {number} [x=0]
 * @param {number} [y=0]
 */
Carrot.Point = function(x, y)
{
    x = x || 0;
    y = y || 0;

    this.setTo(x, y);

    return this;
};

Carrot.Point.prototype =
{
    /**
     * Sets the point up.
     *
     * @method Carrot.Point#setTo
     * @param {number} x
     * @param {number} y
     */
    setTo(x, y)
    {
       this.x = x || 0;
       this.y = y || 0;
    }
};

/**
 * Creates a rectangle.
 *
 * @class Carrot.Rectangle
 * @constructor
 * @param {number} [x=0]
 * @param {number} [y=0]
 * @param {number} [width=0]
 * @param {number} [height=0]
 */
Carrot.Rectangle = function(x, y, width, height)
{
    x = x || 0;
    y = y || 0;
    width = width || 0;
    height = height || 0;

    this.setTo(x, y, width, height);

    return this;
};

Carrot.Rectangle.prototype =
{
    /**
     * Sets the rectangle up.
     *
     * @method Carrot.Rectangle#setTo
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    setTo(x, y, width, height)
    {
       this.x = x || 0;
       this.y = y || 0;
       this.width = width || 0;
       this.height = height || 0;
   }
};

/**
 * Creates a circle.
 *
 * @class Carrot.Circle
 * @constructor
 * @param {number} [x=0]
 * @param {number} [y=0]
 * @param {diameter} [diameter=0]
 */
Carrot.Circle = function(x, y, diameter)
{
    x = x || 0;
    y = y || 0;
    diameter = diameter || 0;

    this.setTo(x, y, diameter);

    return this;
};

Carrot.Circle.prototype =
{
    /**
     * Sets the circle up.
     *
     * @method Carrot.Circle#setTo
     * @param {number} x
     * @param {number} y
     * @param {number} diameter
     */
    setTo(x, y, diameter)
    {
       this.x = x || 0;
       this.y = y || 0;
       this.diameter = diameter || 0;
       this.radius = diameter * 0.5;
   }
};

/**
 * This claass offers the possibility of creating sprites and groups.
 *
 * @constructor
 * @param {Carrot.Game} game - The core game object.
 */
Carrot.ObjectFactory = function(game)
{
    this.game = game;

    return this;
};

Carrot.ObjectFactory.prototype =
{
    /**
     * Creates a sprite.
     * @method Carrot.ObjectFactory#sprite
     * @param {number} [x=0] - X position
     * @param {number} [y=0] - Y position
     * @param {string} [key=null] - The key (name) of the image. If null, the sprite will be a green rectangle.
     * @param {number} [frame=0] - The initial frame to show. Only for spritesheets.
     */
    sprite(x, y, key, frame)
    {
        x = x || 0;
        y = y || 0;
        key = key || null;
        frame = frame || 0;
        return new Carrot.Sprite(this.game, x, y, key, frame);
    },

    /**
     * Creates a group.
     * @method Carrot.ObjectFactory#group
     */
    group()
    {
        return new Carrot.Group(this.game);
    }
};

Carrot.ObjectFactory.prototype.constructor = Carrot.ObjectFactory;

/**
 * A very basic asset loader without progess functions. Yet.
 *
 * @class Carrot.AssetLoader
 * @constructor
 * @param {Carrot.Game} game - The core game object.
 */
Carrot.AssetLoader = function(game)
{
    this.game = game;

    this.filesLoaded = 0;
    this.filesToLoad = 0;

    return this;
};

Carrot.AssetLoader.prototype =
{
    /**
     * Loads a simple image.
     *
     * @method Carrot.AssetLoader#image
     * @param {string} key - The path (url) to the image.
     * @param {string} path - The key (name) for the image.
     */
    image(key, path)
    {
        let that = this;
        let img = new Image();
        img.src = path;
        img.onload = function(event)
        {
            that.filesLoaded += 1;

            that.checkFilesLoaded();
        };
        img.onerror = function(event)
        {
            delete that.game.cache.images[key];
        };
        this.game.cache.images[key] = img;

        this.filesToLoad += 1;
    },

    /**
     * Loads a spritesheet.
     *
     * @method Carrot.AssetLoader#spritesheet
     * @param {string} key - The path (url) to the image.
     * @param {string} path - The key (name) for the image.
     * @param {number} [frameWidth=32] - The width of the spritesheet's frames.
     * @param {number} [frameHeight=32] - The height of the spritesheet's frames.
     * @param {number} [frameIndexes=Infinity] - The frames indexes.
     */
    spritesheet(key, path, frameWidth, frameHeight, frameIndexes)
    {
        frameWidth   = frameWidth   || 32;
        frameHeight  = frameHeight  || 32
        frameIndexes = frameIndexes || Infinity;

        let that = this;
        let img = new Image();
        img.src = path;
        img.onload = function(event)
        {
            // Save frames for spritesheet animation
            let frames = [];
            let frameFound = 0;

            for (let x = 0; x < that.width; x += frameWidth)
            {
                for (let y = 0; y < that.height; y += frameHeight)
                {
                    frameFound += 1;
                    if (frameFound === frameIndexes) break;
                    {
                        frames.push(
                        {
                            x: -x,
                            y: -y
                        });
                    }
                }
            }

            that.game.cache.images[key].frames = frames;

            that.filesLoaded += 1;

            that.checkFilesLoaded();
        };
        img.onerror = function(event)
        {
            delete that.game.cache.images[key];
        };

        this.game.cache.images[key] = img;
        this.game.cache.images[key].frames = [];
        this.game.cache.images[key].frameWidth = frameWidth;
        this.game.cache.images[key].frameHeight = frameHeight;

        this.filesToLoad += 1;
    },

    /**
     * Loads a sound.
     *
     * @method Carrot.AssetLoader#sound
     * @param {string} key - The path (url) to the sound.
     * @param {string} path - The key (name) for the sound.
     */
    sound(key, path)
    {
        let that = this;
        let sound = new Audio();
        sound.src = path;
        sound.onload = function(event)
        {
            that.filesLoaded += 1;

            that.checkFilesLoaded();
        };
        sound.onerror = function(event)
        {
            delete that.game.cache.sounds[key];
        };
        this.game.cache.sounds[key] = sound;

        this.filesToLoad += 1;
    },

    /**
     * Checks if all files are loaded. If yes, it starts the game.
     *
     * @method Carrot.AssetLoader#checkFilesLoaded
     * @private
     */
     checkFilesLoaded()
     {
         if (this.filesToLoad === this.filesLoaded)
         {
             this.game.start(this.game);
         }
     }
};

Carrot.AssetLoader.prototype.constructor = Carrot.AssetLoader;

/**
 * This class handles all keyboard interactions.
 *
 * @constructor
 * @param {Carrot.Game} game - The core game object.
 */
Carrot.Keyboard = function(game)
{
    this.isDown = {};
    this.isPressed = {};
    this.isUp = {};

    // Internal values
    this.game = game;

    // Set all buttons to false
    for (let i = 0; i < 200; i++)
    {
        this.isDown[i]    = false;
        this.isPressed[i] = false;
        this.isUp[i]      = false;
    }

    // Add the event listeners for the mouse to the game container
    let gameDiv = this.game.parent;
    let that = this;
    window.addEventListener('keydown', function(event)
    {
        that.isDown[event.keyCode]    = true;
        that.isPressed[event.keyCode] = false;
        that.isUp[event.keyCode]      = false;
    }, false);

    window.addEventListener('keypress', function(event)
    {
        that.isDown[event.keyCode]    = true;
        that.isPressed[event.keyCode] = true;
        that.isUp[event.keyCode]      = false;
    }, false);

    window.addEventListener('keyup', function(event)
    {
        that.isDown[event.keyCode]    = false;
        that.isPressed[event.keyCode] = false;
        that.isUp[event.keyCode]      = true;
    }, false);

    return this;
};

Carrot.Keyboard.prototype =
{
    isDown(key)
    {

    },

    isUp(key)
    {

    }
};

Carrot.Keyboard.prototype.constructor = Carrot.Keyboard;

/**
 * This class stores common keyCodes of keyboards, so there is no need to memorize them.
 *
 * @class Carrot.KeyCode
 * @static
 */
Carrot.KeyCode =
{
    /** @static */
    A: "A".toUpperCase().charCodeAt(0),
    /** @static */
    B: "B".toUpperCase().charCodeAt(0),
    /** @static */
    C: "C".toUpperCase().charCodeAt(0),
    /** @static */
    D: "D".toUpperCase().charCodeAt(0),
    /** @static */
    E: "E".toUpperCase().charCodeAt(0),
    /** @static */
    F: "F".toUpperCase().charCodeAt(0),
    /** @static */
    G: "G".toUpperCase().charCodeAt(0),
    /** @static */
    H: "H".toUpperCase().charCodeAt(0),
    /** @static */
    I: "I".toUpperCase().charCodeAt(0),
    /** @static */
    J: "J".toUpperCase().charCodeAt(0),
    /** @static */
    K: "K".toUpperCase().charCodeAt(0),
    /** @static */
    L: "L".toUpperCase().charCodeAt(0),
    /** @static */
    M: "M".toUpperCase().charCodeAt(0),
    /** @static */
    N: "N".toUpperCase().charCodeAt(0),
    /** @static */
    O: "O".toUpperCase().charCodeAt(0),
    /** @static */
    P: "P".toUpperCase().charCodeAt(0),
    /** @static */
    Q: "Q".toUpperCase().charCodeAt(0),
    /** @static */
    R: "R".toUpperCase().charCodeAt(0),
    /** @static */
    S: "S".toUpperCase().charCodeAt(0),
    /** @static */
    T: "T".toUpperCase().charCodeAt(0),
    /** @static */
    U: "U".toUpperCase().charCodeAt(0),
    /** @static */
    V: "V".toUpperCase().charCodeAt(0),
    /** @static */
    W: "W".toUpperCase().charCodeAt(0),
    /** @static */
    X: "X".toUpperCase().charCodeAt(0),
    /** @static */
    Y: "Y".toUpperCase().charCodeAt(0),
    /** @static */
    Z: "Z".toUpperCase().charCodeAt(0),
    /** @static */
    ZERO: "0".charCodeAt(0),
    /** @static */
    ONE: "1".charCodeAt(0),
    /** @static */
    TWO: "2".charCodeAt(0),
    /** @static */
    THREE: "3".charCodeAt(0),
    /** @static */
    FOUR: "4".charCodeAt(0),
    /** @static */
    FIVE: "5".charCodeAt(0),
    /** @static */
    SIX: "6".charCodeAt(0),
    /** @static */
    SEVEN: "7".charCodeAt(0),
    /** @static */
    EIGHT: "8".charCodeAt(0),
    /** @static */
    NINE: "9".charCodeAt(0),
    /** @static */
    NUMPAD_0: 96,
    /** @static */
    NUMPAD_1: 97,
    /** @static */
    NUMPAD_2: 98,
    /** @static */
    NUMPAD_3: 99,
    /** @static */
    NUMPAD_4: 100,
    /** @static */
    NUMPAD_5: 101,
    /** @static */
    NUMPAD_6: 102,
    /** @static */
    NUMPAD_7: 103,
    /** @static */
    NUMPAD_8: 104,
    /** @static */
    NUMPAD_9: 105,
    /** @static */
    NUMPAD_MULTIPLY: 106,
    /** @static */
    NUMPAD_ADD: 107,
    /** @static */
    NUMPAD_ENTER: 108,
    /** @static */
    NUMPAD_SUBTRACT: 109,
    /** @static */
    NUMPAD_DECIMAL: 110,
    /** @static */
    NUMPAD_DIVIDE: 111,
    /** @static */
    F1: 112,
    /** @static */
    F2: 113,
    /** @static */
    F3: 114,
    /** @static */
    F4: 115,
    /** @static */
    F5: 116,
    /** @static */
    F6: 117,
    /** @static */
    F7: 118,
    /** @static */
    F8: 119,
    /** @static */
    F9: 120,
    /** @static */
    F10: 121,
    /** @static */
    F11: 122,
    /** @static */
    F12: 123,
    /** @static */
    F13: 124,
    /** @static */
    F14: 125,
    /** @static */
    F15: 126,
    /** @static */
    COLON: 186,
    /** @static */
    EQUALS: 187,
    /** @static */
    COMMA: 188,
    /** @static */
    UNDERSCORE: 189,
    /** @static */
    PERIOD: 190,
    /** @static */
    QUESTION_MARK: 191,
    /** @static */
    TILDE: 192,
    /** @static */
    OPEN_BRACKET: 219,
    /** @static */
    BACKWARD_SLASH: 220,
    /** @static */
    CLOSED_BRACKET: 221,
    /** @static */
    QUOTES: 222,
    /** @static */
    BACKSPACE: 8,
    /** @static */
    TAB: 9,
    /** @static */
    CLEAR: 12,
    /** @static */
    ENTER: 13,
    /** @static */
    SHIFT: 16,
    /** @static */
    CONTROL: 17,
    /** @static */
    ALT: 18,
    /** @static */
    CAPS_LOCK: 20,
    /** @static */
    ESC: 27,
    /** @static */
    SPACEBAR: 32,
    /** @static */
    PAGE_UP: 33,
    /** @static */
    PAGE_DOWN: 34,
    /** @static */
    END: 35,
    /** @static */
    HOME: 36,
    /** @static */
    LEFT: 37,
    /** @static */
    UP: 38,
    /** @static */
    RIGHT: 39,
    /** @static */
    DOWN: 40,
    /** @static */
    PLUS: 43,
    /** @static */
    MINUS: 44,
    /** @static */
    INSERT: 45,
    /** @static */
    DELETE: 46,
    /** @static */
    HELP: 47,
    /** @static */
    NUM_LOCK: 144
};

// Duplicate Carrot.KeyCode values in Carrot.Keyboard for compatibility
for (var key in Carrot.KeyCode)
{
    if (Carrot.KeyCode.hasOwnProperty(key) && !key.match(/[a-z]/))
    {
        Carrot.Keyboard[key] = Carrot.KeyCode[key];
    }
}

/**
 * This class stores the hex values of the 140 standard HTML & CSS colors, so there is no need to memorize them.
 *
 * @class Carrot.Color
 * @static
 */
Carrot.Color =
{
    /** @static */
    AliceBlue: "#F0F8FF",
    /** @static */
    AntiqueWhite: "#FAEBD7",
    /** @static */
    Aqua: "#00FFFF",
    /** @static */
    Aquamarine: "#7FFFD4",
    /** @static */
    Azure: "#F0FFFF",
    /** @static */
    Beige: "#F5F5DC",
    /** @static */
    Bisque: "#FFE4C4",
    /** @static */
    Black: "#000000",
    /** @static */
    BlanchedAlmond: "#FFEBCD",
    /** @static */
    Blue: "#0000FF",
    /** @static */
    BlueViolet: "#8A2BE2",
    /** @static */
    Brown: "#A52A2A",
    /** @static */
    BurlyWood: "#DEB887",
    /** @static */
    CadetBlue: "#5F9EA0",
    /** @static */
    Chartreuse: "#7FFF00",
    /** @static */
    Chocolate: "#D2691E",
    /** @static */
    Coral: "#FF7F50",
    /** @static */
    CornflowerBlue: "#6495ED",
    /** @static */
    Cornsilk: "#FFF8DC",
    /** @static */
    Crimson: "#DC143C",
    /** @static */
    Cyan: "#00FFFF",
    /** @static */
    DarkBlue: "#00008B",
    /** @static */
    DarkCyan: "#008B8B",
    /** @static */
    DarkGoldenRod: "#B8860B",
    /** @static */
    DarkGray: "#A9A9A9",
    /** @static */
    DarkGrey: "#A9A9A9",
    /** @static */
    DarkGreen: "#006400",
    /** @static */
    DarkKhaki: "#BDB76B",
    /** @static */
    DarkMagenta: "#8B008B",
    /** @static */
    DarkOliveGreen: "#556B2F",
    /** @static */
    DarkOrange: "#FF8C00",
    /** @static */
    DarkOrchid: "#9932CC",
    /** @static */
    DarkRed: "#8B0000",
    /** @static */
    DarkSalmon: "#E9967A",
    /** @static */
    DarkSeaGreen: "#8FBC8F",
    /** @static */
    DarkSlateBlue: "#483D8B",
    /** @static */
    DarkSlateGray: "#2F4F4F",
    /** @static */
    DarkSlateGrey: "#2F4F4F",
    /** @static */
    DarkTurquoise: "#00CED1",
    /** @static */
    DarkViolet: "#9400D3",
    /** @static */
    DeepPink: "#FF1493",
    /** @static */
    DeepSkyBlue: "#00BFFF",
    /** @static */
    DimGray: "#696969",
    /** @static */
    DimGrey: "#696969",
    /** @static */
    DodgerBlue: "#1E90FF",
    /** @static */
    FireBrick: "#B22222",
    /** @static */
    FloralWhite: "#FFFAF0",
    /** @static */
    ForestGreen: "#228B22",
    /** @static */
    Fuchsia: "#FF00FF",
    /** @static */
    Gainsboro: "#DCDCDC",
    /** @static */
    GhostWhite: "#F8F8FF",
    /** @static */
    Gold: "#FFD700",
    /** @static */
    GoldenRod: "#DAA520",
    /** @static */
    Gray: "#808080",
    /** @static */
    Grey: "#808080",
    /** @static */
    Green: "#008000",
    /** @static */
    GreenYellow: "#ADFF2F",
    /** @static */
    HoneyDew: "#F0FFF0",
    /** @static */
    HotPink: "#FF69B4",
    /** @static */
    IndianRed : "#CD5C5C",
    /** @static */
    Indigo  : "#4B0082",
    /** @static */
    Ivory: "#FFFFF0",
    /** @static */
    Khaki: "#F0E68C",
    /** @static */
    Lavender: "#E6E6FA",
    /** @static */
    LavenderBlush: "#FFF0F5",
    /** @static */
    LawnGreen: "#7CFC00",
    /** @static */
    LemonChiffon: "#FFFACD",
    /** @static */
    LightBlue: "#ADD8E6",
    /** @static */
    LightCoral: "#F08080",
    /** @static */
    LightCyan: "#E0FFFF",
    /** @static */
    LightGoldenRodYellow: "#FAFAD2",
    /** @static */
    LightGray: "#D3D3D3",
    /** @static */
    LightGrey: "#D3D3D3",
    /** @static */
    LightGreen: "#90EE90",
    /** @static */
    LightPink: "#FFB6C1",
    /** @static */
    LightSalmon: "#FFA07A",
    /** @static */
    LightSeaGreen: "#20B2AA",
    /** @static */
    LightSkyBlue: "#87CEFA",
    /** @static */
    LightSlateGray: "#778899",
    /** @static */
    LightSlateGrey: "#778899",
    /** @static */
    LightSteelBlue: "#B0C4DE",
    /** @static */
    LightYellow: "#FFFFE0",
    /** @static */
    Lime: "#00FF00",
    /** @static */
    LimeGreen: "#32CD32",
    /** @static */
    Linen: "#FAF0E6",
    /** @static */
    Magenta: "#FF00FF",
    /** @static */
    Maroon: "#800000",
    /** @static */
    MediumAquaMarine: "#66CDAA",
    /** @static */
    MediumBlue: "#0000CD",
    /** @static */
    MediumOrchid: "#BA55D3",
    /** @static */
    MediumPurple: "#9370DB",
    /** @static */
    MediumSeaGreen: "#3CB371",
    /** @static */
    MediumSlateBlue: "#7B68EE",
    /** @static */
    MediumSpringGreen: "#00FA9A",
    /** @static */
    MediumTurquoise: "#48D1CC",
    /** @static */
    MediumVioletRed: "#C71585",
    /** @static */
    MidnightBlue: "#191970",
    /** @static */
    MintCream: "#F5FFFA",
    /** @static */
    MistyRose: "#FFE4E1",
    /** @static */
    Moccasin: "#FFE4B5",
    /** @static */
    NavajoWhite: "#FFDEAD",
    /** @static */
    Navy: "#000080",
    /** @static */
    OldLace: "#FDF5E6",
    /** @static */
    Olive: "#808000",
    /** @static */
    OliveDrab: "#6B8E23",
    /** @static */
    Orange: "#FFA500",
    /** @static */
    OrangeRed: "#FF4500",
    /** @static */
    Orchid: "#DA70D6",
    /** @static */
    PaleGoldenRod: "#EEE8AA",
    /** @static */
    PaleGreen: "#98FB98",
    /** @static */
    PaleTurquoise: "#AFEEEE",
    /** @static */
    PaleVioletRed: "#DB7093",
    /** @static */
    PapayaWhip: "#FFEFD5",
    /** @static */
    PeachPuff: "#FFDAB9",
    /** @static */
    Peru: "#CD853F",
    /** @static */
    Pink: "#FFC0CB",
    /** @static */
    Plum: "#DDA0DD",
    /** @static */
    PowderBlue: "#B0E0E6",
    /** @static */
    Purple: "#800080",
    /** @static */
    RebeccaPurple: "#663399",
    /** @static */
    Red: "#FF0000",
    /** @static */
    RosyBrown: "#BC8F8F",
    /** @static */
    RoyalBlue: "#4169E1",
    /** @static */
    SaddleBrown: "#8B4513",
    /** @static */
    Salmon: "#FA8072",
    /** @static */
    SandyBrown: "#F4A460",
    /** @static */
    SeaGreen: "#2E8B57",
    /** @static */
    SeaShell: "#FFF5EE",
    /** @static */
    Sienna: "#A0522D",
    /** @static */
    Silver: "#C0C0C0",
    /** @static */
    SkyBlue: "#87CEEB",
    /** @static */
    SlateBlue: "#6A5ACD",
    /** @static */
    SlateGray: "#708090",
    /** @static */
    SlateGrey: "#708090",
    /** @static */
    Snow: "#FFFAFA",
    /** @static */
    SpringGreen: "#00FF7F",
    /** @static */
    SteelBlue: "#4682B4",
    /** @static */
    Tan: "#D2B48C",
    /** @static */
    Teal: "#008080",
    /** @static */
    Thistle: "#D8BFD8",
    /** @static */
    Tomato: "#FF6347",
    /** @static */
    Turquoise: "#40E0D0",
    /** @static */
    Violet: "#EE82EE",
    /** @static */
    Wheat: "#F5DEB3",
    /** @static */
    White: "#FFFFFF",
    /** @static */
    WhiteSmoke: "#F5F5F5",
    /** @static */
    Yellow: "#FFFF00",
    /** @static */
    YellowGreen: "#9ACD32",
};

/**
 * This class handles all mouse interactions (but the mouse wheel, yet).
 *
 * @constructor
 * @param {Carrot.Game} game - The core game object.
 */
Carrot.Mouse = function(game)
{
    this.x = 0;
    this.y = 0;
    this.isDown = [];
    this.isUp = [];

    // Internal values
    this.game = game;

    // Add the event listeners for the mouse to the game container
    let gameDiv = this.game.parent;
    let that = this;

    gameDiv.addEventListener("mousemove", function(event)
    {
        that.x = event.offsetX;
        that.y = event.offsetY;
    }, true);

    gameDiv.addEventListener("mousedown", function(event)
    {
        that.isDown[event.button] = true;
        that.isUp[event.button]   = false;
    }, true);

    gameDiv.addEventListener("mouseup",   function(event)
    {
        that.isDown[event.button] = false;
        that.isUp[event.button]   = true;
    }, true);

    return this;
}

/** @static */
Carrot.Mouse.LEFT_BUTTON = 0;
/** @static */
Carrot.Mouse.MIDDLE_BUTTON = 1;
/** @static */
Carrot.Mouse.RIGHT_BUTTON = 2;

// The stuff below is not working yet
Carrot.Mouse.prototype =
{
    onMouseMove(event)
    {
        this.x = event.offsetX;
        this.y = event.offsetY;
    },

    onMouseDown(event)
    {
        this.isDown[event.button] = true;
        this.isUp[event.button]   = false;
    },

    onMouseUp(event)
    {
        this.isDown[event.button] = false;
        this.isUp[event.button]   = true;
    }
};

Carrot.Mouse.prototype.constructor = Carrot.Mouse;

// Type IDs

/** @static */
Carrot.SPRITE = 0;
/** @static */
Carrot.GROUP = 1;

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/**
 * mainloop.js 1.0.3-20170529
 *
 * @author Isaac Sukin (http://www.isaacsukin.com/)
 * @license MIT
 */

!function(a){function b(a){if(x=q(b),!(a<e+l)){for(d+=a-e,e=a,t(a,d),a>i+h&&(f=g*j*1e3/(a-i)+(1-g)*f,i=a,j=0),j++,k=0;d>=c;)if(u(c),d-=c,++k>=240){o=!0;break}v(d/c),w(f,o),o=!1}}var c=1e3/60,d=0,e=0,f=60,g=.9,h=1e3,i=0,j=0,k=0,l=0,m=!1,n=!1,o=!1,p="object"==typeof window?window:a,q=p.requestAnimationFrame||function(){var a=Date.now(),b,d;return function(e){return b=Date.now(),d=Math.max(0,c-(b-a)),a=b+d,setTimeout(function(){e(b+d)},d)}}(),r=p.cancelAnimationFrame||clearTimeout,s=function(){},t=s,u=s,v=s,w=s,x;a.MainLoop={getSimulationTimestep:function(){return c},setSimulationTimestep:function(a){return c=a,this},getFPS:function(){return f},getMaxAllowedFPS:function(){return 1e3/l},setMaxAllowedFPS:function(a){return"undefined"==typeof a&&(a=1/0),0===a?this.stop():l=1e3/a,this},resetFrameDelta:function(){var a=d;return d=0,a},setBegin:function(a){return t=a||t,this},setUpdate:function(a){return u=a||u,this},setDraw:function(a){return v=a||v,this},setEnd:function(a){return w=a||w,this},start:function(){return n||(n=!0,x=q(function(a){v(1),m=!0,e=a,i=a,j=0,x=q(b)})),this},stop:function(){return m=!1,n=!1,r(x),this},isRunning:function(){return m}},"function"==typeof define&&define.amd?define(a.MainLoop):"object"==typeof module&&null!==module&&"object"==typeof module.exports&&(module.exports=a.MainLoop)}(this);