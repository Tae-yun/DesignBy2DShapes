"use strict";

var canvas;
var gl;

var tBuffer;
var vTexCoord;

var widthLoc;
var heightLoc;
var colorLoc;

var colors=[
	[ 1.0, 0.0, 0.0, 1.0 ], // Red
	[ 1.0, 1.0, 0.0, 1.0 ], // Yellow
	[ 0.0, 1.0, 0.0, 1.0 ], // Green
	[ 0.0, 0.0, 1.0, 1.0 ], // Blue
	[ 1.0, 0.0, 1.0, 1.0 ], // Magenta
	[ 0.0, 1.0, 1.0, 1.0 ], // Cyan
	[ 0.0, 0.0, 0.0, 1.0 ], // Black
	[ 1.0, 1.0, 1.0, 1.0 ] // White-Eraser
];

function design(event){ // Design
	var shape=document.getElementById("ShapeMenuBar").value;
	var color=Number(document.getElementById("ColorMenuBar").value);
	var box=canvas.getBoundingClientRect();
	var x=event.clientX-box.left;
	var y=event.clientY-box.top;
	var vertices;
	var i;
	gl.uniform4fv(colorLoc,colors[color]);
	
	switch(shape)
	{
	case "Square": // Square
		vertices=new Float32Array(8);
		vertices[0]=x-35.0;
		vertices[1]=y-35.0;
		vertices[2]=x-35.0;
		vertices[3]=y+35.0;
		vertices[4]=x+35.0;
		vertices[5]=y+35.0;
		vertices[6]=x+35.0;
		vertices[7]=y-35.0;
		break;
	case "Circle": // Circle
		vertices=new Float32Array(64);
		i=0;
		for(var c=0;c<32;c++)
		{
			var theta=(2*Math.PI)*c/32;
			vertices[i++]=x+Math.cos(theta)*35;
			vertices[i++]=y+Math.sin(theta)*35;
		}
		break;
	default: // Triangle
		vertices=new Float32Array(6);
		vertices[0]=x-35.0;
		vertices[1]=y+25.0;
		vertices[2]=x+35.0;
		vertices[3]=y+25.0;
		vertices[4]=x+0.0;
		vertices[5]=y-45.0;
		break;
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER,tBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);
	gl.vertexAttribPointer(vTexCoord,2,gl.FLOAT,false,0,0);
	gl.drawArrays(gl.TRIANGLE_FAN,0,vertices.length/2);
}

function download() // Download
{
		var download=document.getElementById("DownloadButton");
		var image=document.getElementById("ty-canvas").toDataURL("image/png")
                    .replace("image/png","image/octet-stream");
		download.setAttribute("href",image);
}

function erase() // Erase
{
		gl.clear(gl.COLOR_BUFFER_BIT);
}

function initShaders(gl,vertexShaderId,fragmentShaderId) // Modified initshader() of initShaders.js
{
	var vertShdr;
	var fragShdr;
	
	var vertElem=document.getElementById(vertexShaderId);
	if(!vertElem)
	{ 
		alert("Unable to load vertex shader "+vertexShaderId);
		return -1;
	}
	vertShdr=gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertShdr,vertElem.text);
	gl.compileShader(vertShdr);
	if(!gl.getShaderParameter(vertShdr,gl.COMPILE_STATUS))
	{
		var msg="Vertex shader failed to compile. The error log is:"
		+"<pre>"+gl.getShaderInfoLog(vertShdr)+"</pre>";
		alert(msg);
		return -1;
	}
	
	var fragElem=document.getElementById(fragmentShaderId);
	if (!fragElem)
	{ 
		alert("Unable to load vertex shader "+fragmentShaderId);
		return -1;
	}
	fragShdr=gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragShdr,fragElem.text);
	gl.compileShader(fragShdr);
	if (!gl.getShaderParameter(fragShdr,gl.COMPILE_STATUS))
	{
		var msg="Fragment shader failed to compile.  The error log is:"
		+"<pre>"+gl.getShaderInfoLog(fragShdr)+"</pre>";
		alert(msg);
		return -1;
	}
	
	var program=gl.createProgram();
	gl.attachShader(program,vertShdr);
	gl.attachShader(program,fragShdr);
	gl.linkProgram(program);
	if(!gl.getProgramParameter(program,gl.LINK_STATUS))
	{
		var msg="Shader program failed to link.  The error log is:"
		+"<pre>"+gl.getProgramInfoLog(program)+"</pre>";
		alert(msg);
		return -1;
	}
	gl.useProgram(program);
		
	tBuffer=gl.createBuffer();
	vTexCoord=gl.getAttribLocation(program,"vTexCoord");
	gl.enableVertexAttribArray(vTexCoord);
		
	widthLoc=gl.getUniformLocation(program,"Width");
	heightLoc=gl.getUniformLocation(program,"Height");
	colorLoc=gl.getUniformLocation(program,"Color");
	gl.uniform1f(widthLoc,canvas.width);
	gl.uniform1f(heightLoc,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
}

window.onload=function init() 
{
	canvas=document.getElementById("ty-canvas");
	gl=canvas.getContext("webgl",{preserveDrawingBuffer:true})||canvas.getContext("experimental-webgl",{preserveDrawingBuffer:true});
	if(!gl)
	{
		alert("WebGL isn't available");
	}
	try 
	{
		var program=initShaders(gl,"vertexShaderId","fragmentShaderId");
	}
	catch(e) 
	{
		alert("WebGL isn't available");
	}
	
	document.getElementById("ShapeMenuBar").value="Triangle"; // Default
	document.getElementById("ColorMenuBar").value="0"; // Default
	canvas.addEventListener("mousedown",design,false);
}