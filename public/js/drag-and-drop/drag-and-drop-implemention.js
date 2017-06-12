

$( function() {
    $( "#droppable").offset({
        left: 130
    });


    $( "#draggable" ).draggable();
    $( "#droppable" ).droppable({
        drop: function( event, ui ) {

			var canvas = new fabric.Canvas('droppable');


            var myImgSrc = $( "#draggable").find("img").attr('src')
            var myimg = fabric.Image.fromURL( myImgSrc, function(oImg) {
                oImg.scale(0.2);

                canvas.add(oImg);
            });
            canvas.selection = true;


            $( "#info" )
                .find("p")
                .html("Name: 'Rasberry Pi'")
                .offset({
                    top: 30,
                    left: 500
                });



            $( "#draggable").remove();


            var myString = "";
            myString = myString.concat("<div id='draggable'><img src='");
            myString = myString.concat(myImgSrc);
            myString = myString.concat("' height='100' width='120'></img></div>");

            $( "body" ).append(myString);


            $( "#draggable" )
                .offset({
                    top: 30,
                    left: 0
                });
            $( "#draggable" ).draggable();


            $( "#droppable").offset({
                left: 130
            });



        },

    });

})



/*
$( function() {

    var canvas = new fabric.Canvas('droppable');

	$( "#droppable").offset({
		left: 130
	});


    $( "#draggable" ).draggable();
    $( "#droppable" ).droppable({
        drop: function( event, ui ) {




            var myImgSrc = $( "#draggable").find("img").attr('src')
            var myimg = fabric.Image.fromURL( myImgSrc, function(oImg) {
                oImg.scale(0.2);

                canvas.add(oImg);
            });
            canvas.selection = true;


            $( "#info" )
                .find("p")
                .html("Name: 'Rasberry Pi'")
                .offset({
                    top: 30,
                    left: 500
                });



            $( "#draggable").remove();


            var myString = "";
            myString = myString.concat("<div id='draggable'><img src='");
            myString = myString.concat(myImgSrc);
            myString = myString.concat("' height='100' width='120'></img></div>");

            $( "body" ).append(myString);


            $( "#draggable" )
                .offset({
                    top: 30,
                    left: 0
                });
             $( "#draggable" ).draggable();


            $( "#droppable").offset({
                left: 130
            });



        },

    });


});
*/
