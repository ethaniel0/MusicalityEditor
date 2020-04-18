let toolActive = false;
let currentTool;
let globalColor = 'dodgerblue';
let canvas, ctx;

let tools = document.querySelectorAll('#tools div');

let methods = {
	color: () => {
		// let rand = Math.floor(Math.random()*360);
		// globalColor = `hsla(${rand}, 100%, 50%)`;
		// document.getElementById('color').style.color = globalColor;
		// document.getElementById('pen').click()
		let cp = document.getElementById('colorpicker');
		if (cp.style.display.charAt(0) == 'n') cp.style.display = 'block';
		else cp.style.display = 'none';
		cp.style.top = tools[0].getBoundingClientRect().bottom + "px";
		let txs = cp.getElementsByTagName('tracks')[0];
		txs.innerHTML = '';
		for (var o of selection.tracks){
			txs.appendChild(o.element);
		}

	},
	eraser: {
		mousedown: (ctx, x, y) => {
			toolActive = true;
			ctx.beginPath();
			ctx.moveTo(x, y);
			
		},
		mousemove: (ctx, x, y) => {
			if(toolActive){
				ctx.lineTo(x, y);
				ctx.lineWidth = 20
				ctx.strokeStyle = 'white';
				ctx.stroke();
			}
		},
		mouseup: () => {
			toolActive = false;
		}
	},
	pen: {
		mousedown: (ctx, x, y) => {
			toolActive = true;
			ctx.beginPath();
			ctx.moveTo(x, y);
			
		},
		mousemove: (ctx, x, y) => {
			if(toolActive){
				ctx.lineTo(x, y);
				ctx.lineWidth = 5
				ctx.strokeStyle = globalColor;
				ctx.stroke();
			}
		},
		mouseup: () => {
			toolActive = false;
		}
	}
}

class Track{
	constructor(name, instrument){
		this.name = name;
		this.instrument = instrument ? instrument : "";
		this.lines = [];
		this.color = '';
		this.canvas = document.createElement('canvas');
		this.newColor();
		this.element = this.makeElement();
	}
	makeElement(){
		var el = document.createElement('track');
		el.style.background = this.color;
		var h = document.createElement('h3');
		h.contentEditable="true"
		h.innerHTML = this.name
		var p = document.createElement('p');
		p.innerHTML = this.instrument;
		el.appendChild(h);
		el.appendChild(p);
		return el;
	}
	newColor(){
		let rand = Math.floor(Math.random()*360);
		this.color = `hsl(${rand}, 80%, 70%)`;
		// this.oppositeColor = `hsl(${(rand + 90)%360}, 100%, 80%)`
		this.oppositeColor = 'hsla(0, 0, 0, 0)';
		if (this.obj){
			this.obj.style.background = this.color;
			this.button.style.background = this.color;
		}
	}
	addNote(pitch, duration, start){
		if (!this.lines.hasOwnProperty(pitch)) this.lines[pitch] = [];
		this.lines[pitch].push([start, duration]);
	}
	addNoteElement(el){
		this.noteElements.push(el);
	}
}

class Record{
	constructor(name, ext, src){
		this.name = name || 'Untitled Record';
		this.ext = ext || '.muse';
		this.src = src;
		this.card;
		this.imgData;
		this.color;
		this.contextMenu = false;
		this.length = 0;
		this.tracks = [];
		this.create();
	}
	init(){
		for(let subTool of tools){
			subTool.style.boxShadow = 'none';
		}
		currentTool = null;

		let zone = document.getElementById('drawing-zone');
		let old = document.querySelectorAll('canvas')[0]
		if(old) old.remove();

		canvas = document.createElement('canvas');
		canvas.width = zone.offsetWidth;
		canvas.height = zone.offsetHeight;
		zone.appendChild(canvas);

		ctx = canvas.getContext('2d');
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, zone.offsetWidth, zone.offsetHeight);

		if(this.imageDraw && !this.imgData){
			let image = new Image();
			image.onload = () => {
				ctx.drawImage(image, 0, 0);
			};
			image.src = this.imageDraw;
		}
		if(this.imgData){
			ctx.putImageData(this.imgData, 0, 0);
		}
		
		canvas.addEventListener('click', () => {
			this.imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		})
	}
	create(){
		if(this.src && this.ext == '.muse'){
			let reader = new FileReader();
			reader.onload = (e) => {
				this.imageDraw = e.target.result;
			};
			reader.readAsText(this.src);
		}
		
		this.card = document.createElement('div');
		this.card.className = 'card';
		this.card.innerHTML = 
		`<div class="i">
			<i class="fas fa-record-vinyl"></i>
		</div>
		<h3 contenteditable="true">${this.name}</h3>
		<span>${this.ext}</span>`;
		
		//onkeydown="return event.key != 'Enter';"
		let h3 = this.card.querySelectorAll('h3')[0];
		let icon = this.card.getElementsByClassName('i')[0];
		icon.onclick = () => this.setColor();
		// icon.addEventListener('click', this.setColor.bind(this))
		h3.addEventListener('keydown', (e) => {
			if(e.key == 'Enter'){
				e.preventDefault()
				return false;
			}
		})
		h3.addEventListener('input', () => {
			if(h3.innerHTML == '') h3.innerHTML = 'Untitled Record';

			this.name = h3.innerHTML
		})
		this.card.addEventListener('click', () => {			
			selection = this;
			this.init();
		})
		this.card.addEventListener("contextmenu", (e) => {
			e.preventDefault();
			killMenu();

			let contextMenu = document.createElement('div');
			contextMenu.className = 'context'
			Object.assign(contextMenu.style, {
				left: `${e.pageX}px`,
				top: `${e.pageY}px`,
				display: 'block'
			})
			let parts = {
				'Delete': () => this.card.remove(),
				'Reset Color': () => this.setColor(),
				'Export': () => {
					let state = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
					download(`${this.name}.muse`, state);
				}
 			}
			for(let key in parts){
				let div = document.createElement('div');
				div.textContent = key;
				div.onclick = () => {
					parts[key]();
				}
				contextMenu.appendChild(div);
			}

			document.body.appendChild(contextMenu);
			
			return false;
		});

		document.getElementById('left').appendChild(this.card);
	}
	setColor(color){
		if(!color) color = Math.floor(Math.random()*360);
		this.color = color;
		this.card.style.backgroundColor = `hsl(${color}, 100%, 80%)`;
	}
	addTrack(track){
		this.tracks.push(track);
	}
}

function killMenu(){
	let menus = document.getElementsByClassName('menu');
	for(let menu of menus){
		menu.remove();
		for(let subKey in states){
			states[subKey].active = false;
		}
	}
	let contextMenus = document.getElementsByClassName('context');
	for(let subMenu of contextMenus){
		subMenu.remove();
	}
}

function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}