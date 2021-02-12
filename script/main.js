const defaultTheme = 'dark';

function applyTheme(theme) {
	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem('theme', theme);
	theme_node = document.getElementById('themeSwitch');
	if (theme == 'light') {
		theme_node.className = "fas fa-moon";
	}
	else if (theme == 'light') {
		theme_node.className = "fas fa-sun";
	}
	render(theme);
}

function updateTheme(theme) {
	var currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : defaultTheme;
	applyTheme(currentTheme);
}

function toggleTheme() {
	var currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : defaultTheme;
	if (currentTheme == 'light') {
		currentTheme = 'dark';
	}
	else {
		currentTheme = 'light';
	}
	applyTheme(currentTheme);
}

function load() {
	updateTheme();
}
