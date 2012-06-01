Vectors = new Meteor.Collection("vectors");
if (Meteor.is_client) {
    Meteor.startup(function () {
        load_canvas("canvas");
    })
    ;
    //
    // load_canvas
    //
    var load_canvas = function(id) {
        //console.log('canvas_new');      
        this.canvas = document.getElementById(id);
        this.canvas.width = 800;
        this.canvas.height = 400;
        this.context = canvas.getContext('2d');
        this.rect = canvas.getBoundingClientRect();      
        this.load = true;
        this.draw = false; 
    }
    
    //
    // draw canvas
    //
    var draw_canvas = function (id, vector) {
        var canvas = document.getElementById(id);
        if (canvas) {
            var context = canvas.getContext('2d');
            context.beginPath();
            context.moveTo(vector.startX - this.rect.left, vector.startY-this.rect.top);
            context.lineTo(vector.endX - this.rect.left, vector.endY-this.rect.top);
            context.stroke();
            context.save();
        }
    }
    
    //
    // clear canvas
    //
    var clear_canvas = function (id, vector) {
        var canvas = document.getElementById("canvas");
        if (canvas) {
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            //console.log('reset');
        }
    }
    //
    // dara trigger
    //
    var cursor = Vectors.find({});
    var handle = cursor.observe({
        added: function (vector) { 
            draw_canvas("canvas",vector);
            //console.log("data added");
        },
        changed: function (vector) { 
            //console.log("data changed"); 
        } ,
        removed: function (vector) {
            clear_canvas(); 
            //console.log("data removed"); 
        } 
    });
    
    //
    // canvas event
    //
    Template.draw.events = {
        'mousedown canvas' : function (ev) {
            if (!ev) ev = event;
            this.startX = ev.pageX;
            this.startY = ev.pageY;
            //console.log('mousedown');      
            this.draw = true;
        },
        'mousemove canvas' : function (ev) {
            if (!ev) ev = event;
            this.endX = ev.pageX;
            this.endY = ev.pageY;
            
            if (this.draw) {
                Vectors.insert({
                    user_id : this._id
                     , startX : this.startX
                     , startY : this.startY
                     , endX : this.endX
                     , endY : this.endY
                     , created : new Date()
                });
                this.startX = this.endX;
                this.startY = this.endY;
            }
            //console.log('mousemove');      
        },
        'mouseup canvas' : function (ev) {
            if (!ev) ev = event;
            this.endX = ev.pageX;
            this.endY = ev.pageY;
            //console.log('mouseup');      
            this.draw = false;
        }
   } 
    
   //
   // contorl events
   //
    Template.control.events = {
        'click button#reset' : function () {
            Vectors.remove({});
        }
    };
}

if (Meteor.is_server) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
