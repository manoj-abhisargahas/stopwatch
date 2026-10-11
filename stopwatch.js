var cs=0, s=0, m=0, h=0, t=0;
var x=0, y=0, z=0; 

function setTime(){
	/* set time visually on web page */
	document.getElementById('t4').innerText = formatT(cs);
	document.getElementById('t3').innerText = formatT(s);
	document.getElementById('t2').innerText = formatT(m);
	document.getElementById('t1').innerText = formatT(h);

	/* set time in variable for next time use */
	cs = Math.floor((t%1000)/10);
	s = Math.floor((t/1000)%60);
	m = Math.floor((t/(1000*60))%60);
	h = Math.floor((t/(1000*60*60))%24);
}

/* format time as 01, 02, ..., 09 */
function formatT(i){
	return (i<10)?("0"+i):i;
}

function startT(){
	// increase the time by 1 centisecond = 10 milliseconds
	x = setInterval(function(){ t+=10; }, 10);

	// set the time visually every centisecond
	y = setInterval(function(){ setTime(); }, 10);

	// set the colors of the h:m:s:cs every centisecond
	z = setInterval(function(){
		if(t>1000){document.getElementById('t3').style.color = 'white';}
		else{document.getElementById('t3').style.color = 'gray';}

		if(t>60000){document.getElementById('t2').style.color = 'white';}
		else{document.getElementById('t2').style.color = 'gray';}

		if(t>3600000){document.getElementById('t1').style.color = 'white';}
		else{document.getElementById('t1').style.color = 'gray';}
	}, 10);

	document.getElementById('start').style.display = 'none';
	document.getElementById('stop').style.display = 'flex';
	document.getElementById('reset').style.display = 'none';
	document.getElementById('lap').style.display = 'flex';
}

function stopT(){
	clearInterval(x);
	clearInterval(y);
	document.getElementById('start').style.display = 'flex';
	document.getElementById('stop').style.display = 'none';
	let reset = document.getElementById('reset');
	reset.style.display = 'flex';
	reset.classList.remove('disabled');
	document.getElementById('lap').style.display = 'none';
}

function clear_t(){
	// location.reload(); // this reloads the whole page

	stopT();
	clearInterval(z);
	cs=0,s=0,m=0,h=0,t=0;
	setTime();
	document.getElementById('t3').style.color = 'gray';
	document.getElementById('t2').style.color = 'gray';
	document.getElementById('t1').style.color = 'gray';
	document.getElementById('reset').classList.add('disabled');
	document.getElementById('readings').innerHTML = '';
	document.getElementById('laps_splits_readings').style.display = 'none';
}

function strTdiff(t_str1, t_str2) {
	return parseInt(t_str1) - parseInt(t_str2);
}

/* StopWatch Time format TextNode */
function swT_FormatTextNode(hours, minutes, seconds, centiseconds) {
	return document.createTextNode(formatT(hours)+":"+formatT(minutes)+":"+formatT(seconds)+"."+formatT(centiseconds))
}

function splitLapT(){
	document.getElementById('laps_splits_readings').style.display = 'flex';
	let readings = document.getElementById('readings');
	let reading = document.createElement('div');
	let splits_p = document.createElement('p');
	let laps_p = document.createElement('p');
	let split_t = swT_FormatTextNode(h, m, s, cs);
	let lap_t = split_t.cloneNode(true);

	if(readings.textContent!='') {
		let now_split_t = split_t.textContent;
		let prev_split_t = (readings.firstChild).textContent;

		let centiseconds = strTdiff(now_split_t.substring(9,11), prev_split_t.substring(9,11));
		let seconds = strTdiff(now_split_t.substring(6,8), prev_split_t.substring(6,8));
		let minutes = strTdiff(now_split_t.substring(3,5), prev_split_t.substring(3,5));
		let hours = strTdiff(now_split_t.substring(0,2), prev_split_t.substring(0,2));

		let isCentisecondsMinus = centiseconds < 0;
		let isSecondsMinus = seconds < 0;
		let isMinutesMinus = minutes < 0;

		centiseconds = centiseconds>=0?centiseconds:100+centiseconds;

		seconds = seconds>=0?seconds:60+seconds;
		if(isCentisecondsMinus) seconds -= 1;

		minutes = minutes>=0?minutes:60+minutes;
		if(isSecondsMinus) minutes -= 1;

		hours = (hours>=0?hours:60+hours);
		if(isMinutesMinus) hours -= 1;
		
		lap_t = swT_FormatTextNode(hours, minutes, seconds, centiseconds);
	}
	
	splits_p.setAttribute('class','splits-style');
	laps_p.setAttribute('class','laps-style');
	splits_p.appendChild(split_t);
	laps_p.appendChild(lap_t);

	reading.setAttribute('class','reading');
	reading.appendChild(splits_p);
	reading.appendChild(laps_p);
	readings.insertBefore(reading, readings.firstChild);
	fadeEffectDisplay(readings);
}

function fadeEffectDisplay(read){	
	let f_e = document.getElementById('fade_effect');
	if(read.clientHeight >= (read.scrollHeight-1))
		f_e.style.display='none';
	else
		f_e.style.display='initial';
}

function saveLapsData() {
	const readings = document.getElementById('readings');
	const readingsList = readings.querySelectorAll('.reading');
	let fullText = 'StopWatch Splits and Laps:\n\n';
	
	// 1. Extract and join sentences/paragraphs
	readingsList.forEach(reading => {
		let split_t = reading.getElementsByClassName('splits-style')[0].textContent;
		let lap_t = reading.getElementsByClassName('laps-style')[0].textContent;
		console.log(reading.getElementsByClassName('splits-style')[0]);
		console.log(split_t);
		split_t = 'Split: ' + split_t + '\n';
		lap_t = 'Lap: ' + lap_t + '\n\n';
		fullText += split_t + lap_t;
	});

	// 2. Create the Blob file
	const fullTextBlob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
	const fileUrl = URL.createObjectURL(fullTextBlob);

	// 3. Create a temporary link and trigger download
	const link = document.createElement('a');
	link.href = fileUrl;
	link.download = 'stopwatch-splits-laps.txt';
	link.style.display = 'none';

	document.body.appendChild(link);
	link.click();

	// 6. Clean up memory and DOM (Always included!)
	// Deletes the hidden <a> tag from the HTML:
	//   Prevents your page's DOM tree from getting cluttered with dead, unused elements every time a user clicks download.
	document.body.removeChild(link);
	// Tells the browser to forget the temporary URL:
	//   URL.revokeObjectURL() is used strictly for cleaning up the browser's internal memory. 
	//   It completely wipes the temporary file data from your computer's RAM. 
	//   If you do not wipe this out, very large files will pile up and crash the browser. 
	//   This cleanup happens completely behind the scenes and has absolutely nothing to do with blocking or downloading your files,
	//   and leaving it out will not cause previously created files to randomly download again.
	URL.revokeObjectURL(fileURL);
}


/* Not used now */
scroll_display = "";
function scroll_show(){
	clearTimeout(scroll_display);
	document.getElementById('show_none').innerHTML = "#readings::-webkit-scrollbar{ display:initial }";
}

function scroll_none(){
	scroll_display = setTimeout(function(){
		document.getElementById('show_none').innerHTML = "#readings::-webkit-scrollbar{ display:none }";
	}, 2000);
}