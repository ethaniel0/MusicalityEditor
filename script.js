let headerOptions = [...document.querySelectorAll('span .options')];
for (let i = 0; i < headerOptions.length; i++) headerOptions[i] = headerOptions[i].parentNode;

// Header
let header = document.querySelectorAll('header')[0],
	options = header.querySelectorAll('span'),
	states = {},
	upload = document.getElementById('file');


let fileTree = [],
	selection = {};

for(let option of options){
	let key = option.innerHTML.toLowerCase();
	states[key] = {
		'option': option
	}
}

// Split View
Split(['#left','#right'], {
    elementStyle: (dimension, size, gutterSize) => ({
        'flex-basis': `calc(${size}% - ${gutterSize}px)`,
    }),
    gutterStyle: (dimension, gutterSize) => ({
        'flex-basis':  `${gutterSize}px`,
    }),
	sizes: [25, 75],
    expandToMin: true,
})

function uploadFile(){
	upload.click();
}
function newFile(){
	fileTree.push(new Record('Untitled Record', null, null));
}
function deleteAll(){
	for(let key of fileTree){
		key.card.remove();
	}
	fileTree = [];
}

function newTrack(){
	let t = new Track('Untitled')
	document.getElementsByTagName('tracks')[0].appendChild(t.element);
	selection.addTrack(t);
}

document.body.addEventListener('click', (e) => {
	killMenu();
	if (headerOptions.includes(e.target)){
		for (let op of headerOptions){
			var options = op.getElementsByTagName('div')[0];
			if (op == e.target){
				options.style.top = (header.clientTop + header.clientHeight) + "px";
				options.style.left = e.target.offsetLeft + "px";
				options.classList.toggle('hide');
			}
			else{
				options.classList.add('hide');
			}
		}
	}
	else{
		for (let op of headerOptions){
			op.getElementsByTagName('div')[0].classList.add('hide');
		}
	}
	// 'Test': () => {
	// 	if(!canvas || !ctx) return;
	// 	let data = canvas.toDataURL("image/png")
	// 	retrieveData(data)
	// 	.then((pixels) => {
	// 		let altered = pixels.filter((piece) => {
	// 			if(!piece.includes('fff')) return
	// 		});

	// 		for(let pixel of altered) {
				
	// 		}
	// 	})
	// }
})

upload.addEventListener('change',(e) => {
	let file = e.target.files[0];	
	if(!file) return;
	let fileExt = file.name.toString().split('.');
	fileExt = `.${fileExt[fileExt.length - 1]}`;
	selection = new Record(file.name.toString().replace(fileExt, ''), fileExt, file)
	fileTree.push(selection);
	useFile(file)

})

for(let tool of tools){

	tool.addEventListener('click', () => {

		for(let subTool of tools){
			subTool.style.boxShadow = 'none';
		}
		currentTool = tool.id;

		document.getElementById(currentTool).style.boxShadow = '0 0 0.3em silver';

		let method = methods[currentTool];

		if(!canvas || !ctx) return;
		if(Object.keys(method).length == 3){
			for(let key in method){
				canvas.addEventListener(key, (e) => {
					if(currentTool != tool.id) return;
					let coord = getCursorPosition(canvas, e);
					method[key](ctx, coord.x, coord.y);
				})
			}
		}
		else{
			method();
		}

	})
}
function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
	return {
		x: event.clientX - rect.left, 
		y: event.clientY - rect.top
	}
}

function parseMidi(currentMidi) {
	length = 0;

	for (let track of currentMidi.tracks){
	
		let name = track.name;
		if (trackNames.hasOwnProperty(name)){
			name = name + ` (${trackNames[name]++})`;
		}
		else{
			trackNames[name] = 1;
			if (name == '') name = '(0)';
		}
		var t = new Track(name, track.instrument.name);

		for (let note in track.notes){
			note = track.notes[note];
			if (note.octave < 0 || note.octave > 7) continue;
			if (note.time + note.duration > length) length = note.time + note.duration;
			t.addNote(note.name, note.duration, note.time);			
		}
		selection.addTrack(t);
	}
}

function useFile(file, track){
	currentTracks = [];
	trackNames = {};
	if (!file) return;
	const reader = new FileReader()
	reader.onload = function(e){
		const midi = new Midi(e.target.result);
		parseMidi(midi);
	}
	reader.readAsArrayBuffer(file)
}