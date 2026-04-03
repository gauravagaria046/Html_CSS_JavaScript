let $ = document

function imgSlider (anything) {
	$.querySelector(".pepsi").src = anything;
}

function changeBgColor(color){
	const sec = $.querySelector(".sec");
	sec.style.background = color;

}

function menuToggle(){
	const toggleMenu = $.querySelector(".toggleMenu")
	const navigation = $.querySelector(".navigation")
	toggleMenu.classList.toggle('active')
	navigation.classList.toggle('active')
}