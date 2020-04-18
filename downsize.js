function retrieveData(src){
	return new Promise((resolve, reject) => {
		let image = new Image();
		image.src = src
		image.onload = () => {
			resolve(image)
		}
		image.onerror = () => {
			reject('Could not load image')
		}
	})
	.then((image) => {
		let _canvas = document.createElement('canvas');
		_canvas.style.display = 'none';
		document.body.appendChild(_canvas);
		let _ctx = _canvas.getContext('2d');
		
		_ctx.drawImage(image, 0, 0, 50, 50 );
		drawRotated(270, _ctx, _canvas, image)
		let fullHex = new Array;
		
		let data = _ctx.getImageData(0, 0, 50, 50).data;
		for(let i = 0; i < data.length; i += 4){
			let hex = rgb(data[i], data[i+1], data[i+2])
			
			fullHex.push(hex);
		}
		_canvas.remove();
		
		return fullHex;
	})
}
function toHex(num){ 
	let hex = Number(num).toString(16);
	if (hex.length < 2) hex = "0" + hex;
	return hex;
};
function rgb(r, g, b) {   
	let red = toHex(r),
		green = toHex(g),
		blue = toHex(b);
	return `${red}${green}${blue}`;
};
function drawRotated(degrees, ctx, canvas, image){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.translate(25, 25);
    ctx.rotate(degrees*Math.PI/180);
    ctx.translate(-25,-25);
	ctx.translate(50, 0);
	ctx.scale(-1, 1);
    ctx.drawImage(image,0,0,50,50)
    ctx.restore();
}
let image = new Image();
			image.onload = () => {
				ctx.drawImage(image, 0, 0);
			};
			image.src = this.imageDraw;