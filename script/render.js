function render(currentTheme) {
	if (currentTheme === 'dark') {
		var clear_color = [0., 0., 0., 1.0];
		var main_color = [1., 1., 1., 1.];
		var accent_color = [0.73, 0.52, 0.98, 1.];
	}
	else if (currentTheme === 'light') {
		var clear_color = [0.87, 0.87, 0.87, 1.0];
		var main_color = [0., 0., 1., 1.];
		var accent_color = [1., 1., 1., 1.];
	}

	render_background_triangles(clear_color, main_color, accent_color);
	//render_background_grid(clear_color, main_color, accent_color);
}

function mat_translate(tx, ty, tz) {
	return [
		1., 0., 0., 0.,
		0., 1., 0., 0.,
		0., 0., 1., 0.,
		tx, ty, tz, 1.,
	];
}

function mat_scale(t) {
	return [
		t, 0., 0., 0.,
		0., t, 0., 0.,
		0., 0., t, 0.,
		0., 0., 0., 1.,
	];
}

function mat_rotateX(a) {
  return [
  	1., 0., 0., 0.,
    0., Math.cos(a), -Math.sin(a), 0.,
    0., Math.sin(a), Math.cos(a), 0.,
    0., 0., 0., 1.
  ];
}

function mat_rotateZ(a) {
  return [
    Math.cos(a), -Math.sin(a), 0., 0.,
    Math.sin(a),  Math.cos(a), 0., 0.,
    0., 0., 1., 0.,
    0., 0., 0., 1.
  ];
}

function mat_projection(fieldOfViewInRadians, aspect, near, far) {
	var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
	var rangeInv = 1.0 / (near - far);

	return [
		f / aspect, 0, 0, 0,
		0, f, 0, 0,
		0, 0, (near + far) * rangeInv, -1,
		0, 0, near * far * rangeInv * 2, 0
	];
}

function create_webgl_context(canvas) {
  // Initialize the GL context
  const gl = canvas.getContext("webgl");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert("Unable to initialize WebGL.");
    return;
  }
	return gl;
}

function create_buffers(gl, vertices, indices) {
	// Create an empty buffer object to store vertex buffer
	var vertex_buffer = gl.createBuffer();

	// Bind appropriate array buffer to it
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

	// Pass the vertex data to the buffer
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(vertices),
		gl.STATIC_DRAW
	);

	// Unbind the buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// Create an empty buffer object to store Index buffer
	var index_buffer = gl.createBuffer();

	// Bind appropriate array buffer to it
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

	// Pass the index data to the buffer
	gl.bufferData(
		gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(indices),
		gl.STATIC_DRAW
	);

	// Unbind the buffer
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	return [vertex_buffer, index_buffer];
}

function create_shader_program(gl, vertCode, fragCode) {
	// Create a vertex shader object
	var vertShader = gl.createShader(gl.VERTEX_SHADER);

	// Attach vertex shader source code
	gl.shaderSource(vertShader, vertCode);

	// Compile the vertex shader
	gl.compileShader(vertShader);
		
	// Create fragment shader object
	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

	// Attach fragment shader source code
	gl.shaderSource(fragShader, fragCode); 

	// Compile the fragment shader
	gl.compileShader(fragShader);

	// Create a shader program object to store
	// the combined shader program
	var shaderProgram = gl.createProgram();

	// Attach a vertex shader
	gl.attachShader(shaderProgram, vertShader);

	// Attach a fragment shader
	gl.attachShader(shaderProgram, fragShader);

	// Link both the programs
	gl.linkProgram(shaderProgram);

	return shaderProgram;
}

function render_background_triangles(clear_color, main_color, accent_color) {
  const canvas = document.querySelector("#glCanvas");
	const gl = create_webgl_context(canvas);

	// configuration: triangles data
	const n_triangles = 10;
	const triangle_type = [
		1, 0, 1, 0, 0,
		1, 1, 1, 0, 0
	];
	const triangle_delay_x = [
		-1.1, -1.3, -0.7, 0.4, 0.1,
		1.5, 0.2, -1.5, -1.3, 0.7
	];
	const triangle_start_x = [
		-1., -1., -1., -1., -1.,
		-1., -1., -1., -1, -1
	];
	const triangle_limit_x = [
		1.0, 1.1, 1.1, 1.1, 1.2,
		1.2, 1., 1.1, 1.3, 1.1
	];
	const triangle_scale = [
		1.1, 1.9, 2.6, 1.6, 1.8,
		1.4, 0.9, 1.4, 1.7, 1.3
	];
	const triangle_pos_y = [
		0.1, -0.6, -1.2, 0., -0.3,
		-1.2, -1.2, -0.7, -1.2, -1.1
	];
	const triangle_d_x = [
		0.002, 0.001, 0.002, 0.0025, 0.0011,
		0.0013, 0.0017, 0.001, 0.0018, 0.001
	];
	const triangle_pos_x = triangle_delay_x;

	// 1) Create the geometry and indices
	const vertices = [
		-0.1, 0.6, 0.,
		-0.1, 0.4, 0.,
		-0.03, 0.5, 0.,
	];
	var indices = [];
	for (triangle_id = 0; triangle_id < n_triangles; triangle_id++) {
		indices = indices.concat([0, 1, 1, 2, 2, 0]);
	}

	// 1.1) Allocate and set the gl buffers
	var buffers = create_buffers(gl, vertices, indices);
	var vertex_buffer = buffers[0];
	var index_buffer = buffers[1];

	// 2) Define the shaders code
	var vertCode =
		'attribute vec3 a_coords;' +
		'uniform mat4 u_translate;' +
		'uniform mat4 u_scale;' +
		'void main(void) {' +
		' gl_Position = u_translate * u_scale * vec4(a_coords, 1.0);' +
		'}';

	var fragCode =
		'uniform mediump vec4 u_color;' +
		'void main(void) {' +
		' gl_FragColor = u_color;' +
		'}';

	// 2.1) Build, link and use the shader program
	shaderProgram = create_shader_program(gl, vertCode, fragCode);
	gl.useProgram(shaderProgram);

	// 2.2) Associate the shaders to the buffer objects/external variables
	var u_color_loc = gl.getUniformLocation(shaderProgram, "u_color");
	var u_scale_loc = gl.getUniformLocation(shaderProgram, "u_scale");
	var u_translate_loc = gl.getUniformLocation(shaderProgram, "u_translate");

	// Bind vertex buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	// Bind index buffer object
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
	// Get the attribute location
	var a_coord_loc = gl.getAttribLocation(shaderProgram, "a_coords");
	// Point an attribute to the currently bound VBO
	gl.vertexAttribPointer(a_coord_loc, 3, gl.FLOAT, false, 0, 0);
	// Enable the attribute
	gl.enableVertexAttribArray(a_coord_loc);

	// 3) Draw the polygons
	var draw = function() {
		// Enable the depth test (disabled by default because of flickering)
		//gl.enable(gl.DEPTH_TEST);
		//gl.clearDepth(1.0);
		var width = gl.canvas.clientWidth;
		var height = gl.canvas.clientHeight;
		gl.canvas.width = width;
		gl.canvas.height = height;

		gl.lineWidth(2.0);
		gl.clearColor(clear_color[0], clear_color[1],
									clear_color[2], clear_color[3]);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

		for (triangle_id = 0; triangle_id < n_triangles; triangle_id++) {
			gl.uniformMatrix4fv(
				u_scale_loc,
				false,
				mat_scale(triangle_scale[triangle_id])
			);
			gl.uniformMatrix4fv(
				u_translate_loc,
				false,
				mat_translate(
					triangle_pos_x[triangle_id],
					triangle_pos_y[triangle_id],
					0.
				)
			);
			if (triangle_type[triangle_id]) {
				gl.uniform4fv(u_color_loc, accent_color);
			}
			else {
				gl.uniform4fv(u_color_loc, main_color);
			}
			gl.drawElements(gl.LINES, 6, gl.UNSIGNED_SHORT, triangle_id * 12);

			triangle_pos_x[triangle_id] += triangle_d_x[triangle_id];
			if (triangle_pos_x[triangle_id] > triangle_limit_x[triangle_id]){
				triangle_pos_x[triangle_id] = triangle_start_x[triangle_id];
			}
		}
	}
	setInterval(draw, 16);
}

function render_background_grid(clear_color, main_color, accent_color) {
  const canvas = document.querySelector("#glCanvas");
	const gl = create_webgl_context(canvas);

	// configuration: grid data
	const grid_resolution = 20;
	const start_x = -0.5;
	const start_y = -0.5;
	const d_x = 1. / grid_resolution;
	const d_y = 1. / grid_resolution;

	// 1) Create the geometry and indices
	const freq = 4.;
	var vertices = new Array(grid_resolution * grid_resolution * 3);
	for (x = 0; x < grid_resolution; x++) {
		for (y = 0; y < grid_resolution; y++) {
			const val_x = start_x + d_x * x;
			const val_y = start_y + d_y * y;
			const val = Math.sin(freq * Math.PI * val_x) *
								  Math.sin(freq * Math.PI * val_y);
			vertices[x * grid_resolution * 3 + y * 3] = val_x;
			vertices[x * grid_resolution * 3 + y * 3 + 1] = val_y;
			vertices[x * grid_resolution * 3 + y * 3 + 2] = val / 128.;
		}
	}
	var indices = [];
	for (x = 0; x < grid_resolution-1; x++) {
		for (y = 0; y < grid_resolution-1; y++) {
			indices.push(y*grid_resolution + x, y*grid_resolution + x+1);
			indices.push(y*grid_resolution + x, (y+1)*grid_resolution + x);
		}
		indices.push(y*grid_resolution + x, y*grid_resolution + x+1);
	}
	for (y = 0; y < grid_resolution-1; y++) {
		indices.push(
			(y+1) * grid_resolution -1,
			(y+2) * grid_resolution -1
		);
	}

	// 1.1) Allocate and set the gl buffers
	var buffers = create_buffers(gl, vertices, indices);
	var vertex_buffer = buffers[0];
	var index_buffer = buffers[1];

	// 2) Define the shaders code
	var vertCode =
		'attribute vec3 a_coords;' +
		'uniform mat4 u_projection;' +
		'uniform mat4 u_rotateZ;' +
		'uniform mat4 u_translate;' +
		'uniform mat4 u_scale;' +
		'void main(void) {' +
		' mat4 model = u_translate * u_rotateZ * u_scale;' +
		' gl_Position = u_projection * model * vec4(a_coords, 1.0);' +
		'}';

	var fragCode =
		'uniform mediump vec4 u_color;' +
		'void main(void) {' +
		' gl_FragColor = u_color;' +
		'}';

	// 2.1) Build, link and use the shader program
	shaderProgram = create_shader_program(gl, vertCode, fragCode);
	gl.useProgram(shaderProgram);

	// 2.2) Associate the shaders to the buffer objects/external variables
	var u_color_loc = gl.getUniformLocation(shaderProgram, "u_color");
	var u_scale_loc = gl.getUniformLocation(shaderProgram, "u_scale");
	var u_translate_loc = gl.getUniformLocation(shaderProgram, "u_translate");
	var u_rotateZ_loc = gl.getUniformLocation(shaderProgram, "u_rotateZ");
	var u_projection_loc = gl.getUniformLocation(shaderProgram, "u_projection");

	// Bind vertex buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	// Bind index buffer object
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
	// Get the attribute location
	var a_coord_loc = gl.getAttribLocation(shaderProgram, "a_coords");
	// Point an attribute to the currently bound VBO
	gl.vertexAttribPointer(a_coord_loc, 3, gl.FLOAT, false, 0, 0);
	// Enable the attribute
	gl.enableVertexAttribArray(a_coord_loc);

	var angleZ = 0;

	// 3) Draw the polygons
	var draw = function() {
		gl.lineWidth(2.0);
		gl.clearColor(clear_color[0], clear_color[1],
									clear_color[2], clear_color[3]);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

		gl.uniformMatrix4fv(u_scale_loc, false, mat_scale(1.));
		gl.uniformMatrix4fv(u_translate_loc, false, mat_translate(-0.3, 0., -0.12));
		gl.uniformMatrix4fv(
			u_rotateZ_loc,
			false,
			mat_rotateZ(angleZ * Math.PI / 180.)
		);
		var aspect = canvas.clientWidth / canvas.clientHeight;
		gl.uniformMatrix4fv(
			u_projection_loc,
			false,
			mat_projection(60., aspect, 0., 10.)
		);
		gl.uniform4fv(u_color_loc, accent_color);
		gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);

		angleZ += 0.1;
		angleZ = angleZ % 360;
	}
	setInterval(draw, 16);
}
