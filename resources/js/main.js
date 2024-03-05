var canvas;
// Meme process

var contentRect;
var contentImage;

function replaceCanvas() {
    template = $('#canvas-template').find(":selected").attr('value')
    if (canvas != null) {
        canvas.dispose();
    }
    var width;
    var height;
    var topBorderMultiplier = 1;
    var border = 10;
    console.log(template)
    switch (template) {
        case 'story':
            width = 1080
            height = 1920;
            topBorderMultiplier = 2;
            break;
        case 'post':
            width = 1080
            height = 1080;
            topBorderMultiplier = 1;
            border = 20;
            break;
        default:
            console.log("error")
    }

    $(window).resize(resizeCanvas)
    function resizeCanvas() {
        var wrapperWidth = $('.fabric-canvas-wrapper').width()
        $('.canvas-container').css('width', wrapperWidth)
        $('.canvas-container').css('height', wrapperWidth * height / width)
    }

    // Intialize fabric canvas
    canvas = new fabric.Canvas('meme-canvas', {
        width: width,
        height: height,
        selection: false,
        allowTouchScrolling: true,
        objectCaching: false,
        backgroundColor: "rgba(138, 180, 20)"
    });

    $('#scale').attr('max', canvas.width * 0.0025)
    $('#scale').val(canvas.width * 0.0025 / 2)

    resizeCanvas();
    canvas.renderAll();
    console.log("replaced")

    topDistance = (canvas.width / border) * topBorderMultiplier
    borderDistance = (canvas.width / border)
    console.log(borderDistance)

    contentRect = new fabric.Rect({
        top: topDistance,
        left: borderDistance,
        width: canvas.width - borderDistance * 2,
        height: canvas.height - (topDistance + borderDistance),
        fill: 'rgba(83,132,48)',
        selectable: false,
    });

    canvas.add(contentRect)
    enableSnap();

}

function enableSnap() {
    var snapZone = 20;
    canvas.on('object:moving', function (options) {
        var objectWidth = options.target.getBoundingRect().width
        // objectWidth = objectWidth * 1.25
        // console.log(options.target.width)
        var objectMiddle = options.target.left + objectWidth / 2;
        if (objectMiddle > canvas.width / 2 - snapZone &&
            objectMiddle < canvas.width / 2 + snapZone) {
            options.target.set({
                left: canvas.width / 2 - objectWidth / 2,
            }).setCoords();
        }
    });
}

replaceCanvas();

$('#canvas-template').off('change').on('change', function () {
    $('#canvas-template').selectpicker('refresh');
    console.log('Change Stroke Width');
    replaceCanvas();

})

$('#add-text').off('click').on('click', function () {
    if ($('#text').val() == '') {
        showAlert('Error! Text field is empty')
        return
    }

    // Create new text object
    var text = new fabric.Text($('#text').val(), {
        top: 200,
        minWidth: canvas.width,
        fontFamily: $('#font-family').find(":selected").attr('value'),
        fontSize: parseInt($('#font-size').val()),
        fontStyle: 'normal',
        textAlign: 'center',
        fill: $('#text-color').find(":selected").attr('value'),
        stroke: '#000000',
        strokeWidth: parseInt($('#stroke-width').val()),
        shadow: createShadow('#000000', $('#shadow-depth').val()),
        objectCaching: false
    })

    text.scaleToWidth(canvas.width / 3)
    $('#scale').val(text.scaleX)

    canvas.add(text).setActiveObject(text);
    loadFont(text.fontFamily);
    canvas.centerObject(text);

})

$('#generate-meme').off('click').on('click', function () {
    var dataURL = canvas.toDataURL({ format: $('#image-format').find(":selected").attr('value'), quality: parseFloat($('#image-quality').find(":selected").attr('value')) });
    var link = document.createElement('a');
    link.href = dataURL;
    link.download = createImgName();
    link.click();
})


$('#add-image').off('input').on('input', function () {
    const file = this.files[0];
    const fileType = file['type'];
    $('#add-image').val('')

    if (!isImage(fileType)) {
        showAlert('Error! Invalid Image')
        return
    }

    const reader = new FileReader()
    reader.onload = function () {
        var image = new Image()
        image.src = reader.result
        image.onload = function () {
            fabric.Image.fromURL(reader.result, function (image) {
                image.scaleToWidth(canvas.width / 2)
                canvas.add(image).setActiveObject(image);
                $('#scale').val(image.scaleX)
            }, {
                opacity: $('#opacity').val()
            })
        }
    }
    reader.readAsDataURL(file)
})

$('#remove-element').off('click').on('click', function () {
    canvas.remove(canvas.getActiveObject())
})

fabric.Object.prototype.set({
    transparentCorners: false,
    cornerColor: 'yellow',
    borderColor: 'rgba(88,42,114)',
    cornerSize: parseInt(canvas.width) * 0.03,
    cornerStrokeColor: '#000000',
    borderScaleFactor: 2,
    padding: 4,
});

// add event listener handlers to edit methods
loadObjectHandlers()

// Update edit methods values to the selected canvas text
canvas.on({
    'selection:created': updateInputs,
    'selection:updated': updateInputs,
    'selection:cleared': enableTextMethods,
})

function processMeme(memeInfo) {
    canvas.remove(contentRect);
    if (contentImage != null) {
        canvas.remove(contentImage);
    }
    // Add meme template as canvas background
    fabric.Image.fromURL(`${memeInfo.url}`, function (meme) {
        widthRelation = contentRect.width / meme.width
        originalHeight = meme.height;
        contentImage = meme;
        meme.selectable = false;
        meme.scaleToWidth(contentRect.width);
        meme.top = contentRect.top;
        meme.left = contentRect.left;
        meme.height = (contentRect.height / widthRelation) + 4
        canvas.add(meme)
    }, {
        crossOrigin: "anonymous"
    });





}