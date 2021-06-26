(function () {
			'use strict'
	
			var forms = document.querySelectorAll('.validate-this')
	
			Array.from(forms).forEach(function (form) {
				form.addEventListener('submit', function (event) {
					if (!form.checkValidity()) {
						event.preventDefault()
						event.stopPropagation()
					}
	console.log("Here in validation form");
			form.classList.add('was-validated')
		  }, false)
		})
	})()
