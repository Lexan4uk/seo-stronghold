function initStudioCasesSwiper() {
	if (typeof Swiper === 'undefined') {
		return
	}

	const toRuntimePx = window.pxToRemRuntime || (designPxValue => designPxValue)
	const getSwiperParams = () => ({
		slidesPerView: 2,
		spaceBetween: toRuntimePx(24)
	})
	const getBreakpointParams = () => ({
		0: {
			slidesPerView: 1,
			spaceBetween: toRuntimePx(16)
		},
		769: {
			slidesPerView: 2,
			spaceBetween: toRuntimePx(44)
		}
	})

	const swiperElements = document.querySelectorAll('.studio__swiper')

	swiperElements.forEach(swiperElement => {
		if (swiperElement.classList.contains('swiper-initialized')) {
			return
		}

		const swiperBlock = swiperElement.parentElement
		const controlsElement = swiperBlock?.querySelector('.studio__swiper-controls')
		const paginationElement = controlsElement?.querySelector('.studio__swiper-pagination')
		const prevButton = controlsElement?.querySelector('.studio__swiper-prev')
		const nextButton = controlsElement?.querySelector('.studio__swiper-next')
		const currentSlideNode = controlsElement?.querySelector('.studio__swiper-current')
		const totalSlideNode = controlsElement?.querySelector('.studio__swiper-total')

		if (!paginationElement || !prevButton || !nextButton) {
			return
		}

		const totalSlides = swiperElement.querySelectorAll('.swiper-slide').length

		if (!totalSlides) {
			return
		}

		const updateEdgeNumbers = swiperInstance => {
			if (!currentSlideNode || !totalSlideNode) {
				return
			}

			const firstVisibleIndex = Math.min(swiperInstance.activeIndex, totalSlides - 1)
			const visibleSlides = Math.max(1, Math.round(Number(swiperInstance.params.slidesPerView) || 1))
			const prevNumber = firstVisibleIndex > 0 ? firstVisibleIndex : null
			const nextNumber = firstVisibleIndex + visibleSlides < totalSlides ? firstVisibleIndex + visibleSlides + 1 : null

			currentSlideNode.textContent = prevNumber === null ? '' : String(prevNumber).padStart(2, '0')
			totalSlideNode.textContent = nextNumber === null ? '' : String(nextNumber).padStart(2, '0')
		}

		const initialParams = getSwiperParams()

		new Swiper(swiperElement, {
			slidesPerView: initialParams.slidesPerView,
			spaceBetween: initialParams.spaceBetween,
			speed: 500,
			breakpoints: getBreakpointParams(),
			navigation: {
				prevEl: prevButton,
				nextEl: nextButton
			},
			pagination: {
				el: paginationElement,
				clickable: true,
				bulletClass: 'studio__swiper-dot',
				bulletActiveClass: 'studio__swiper-dot--active',
				renderBullet(index, className) {
					return `<button type="button" class="${className}" aria-label="Go to slide ${index + 1}"></button>`
				}
			},
			on: {
				init(swiperInstance) {
					updateEdgeNumbers(swiperInstance)
				},
				slideChange(swiperInstance) {
					updateEdgeNumbers(swiperInstance)
				}
			}
		})
	})
}

function initStudioMethodHover() {
	const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
	const isDesktop = window.matchMedia('(min-width: 769px)').matches

	if (!canHover || !isDesktop) {
		return
	}

	const methodItems = document.querySelectorAll('[data-studio-method-hover]')

	if (!methodItems.length) {
		return
	}

	const setActive = methodItem => {
		methodItem.dataset.studioMethodHoverActive = 'true'
	}

	const clearActive = methodItem => {
		delete methodItem.dataset.studioMethodHoverActive
	}

	methodItems.forEach(methodItem => {
		const methodImage = methodItem.querySelector('[data-studio-method-hover-image]')

		if (!methodImage) {
			return
		}

		methodItem.addEventListener('mouseenter', () => setActive(methodItem))
		methodItem.addEventListener('mouseleave', () => clearActive(methodItem))
	})
}

function initStudioRequestForm() {
	const forms = document.querySelectorAll('.studio__request-form')

	if (!forms.length) {
		return
	}

	const isValidPhone = phone => {
		const digits = String(phone || '').replace(/\D/g, '')
		return digits.length >= 11
	}

	forms.forEach(form => {
		const nameInput = form.querySelector('input[name="name"]')
		const phoneInput = form.querySelector('input[name="phone"]')
		const siteInput = form.querySelector('input[name="site"]')

		if (!nameInput || !phoneInput || !siteInput) {
			return
		}

		const errorNodes = form.querySelectorAll('[data-error-for]')

		const getFieldErrorNode = field => {
			const input = form.querySelector(`input[name="${field}"]`)
			if (!input) {
				return null
			}

			const fieldLabel = input.closest('label')
			if (!fieldLabel) {
				return null
			}

			return fieldLabel.querySelector('[data-error-for]')
		}

		const clearErrors = () => {
			errorNodes.forEach(node => {
				node.classList.add('hidden')
			})
		}

		const showFieldError = field => {
			const node = getFieldErrorNode(field)
			if (!node) {
				return
			}

			node.classList.remove('hidden')
		}

		const hideFieldError = field => {
			const node = getFieldErrorNode(field)
			if (!node) {
				return
			}

			node.classList.add('hidden')
		}

		nameInput.addEventListener('input', () => hideFieldError('name'))
		phoneInput.addEventListener('input', () => hideFieldError('phone'))
		siteInput.addEventListener('input', () => hideFieldError('site'))

		form.addEventListener('submit', event => {
			event.preventDefault()
			clearErrors()

			const formData = new FormData(form)
			const name = String(formData.get('name') || '').trim()
			const phone = String(formData.get('phone') || '').trim()
			const site = String(formData.get('site') || '').trim()
			let hasError = false

			if (name.length < 2) {
				showFieldError('name')
				hasError = true
			}

			if (!isValidPhone(phone)) {
				showFieldError('phone')
				hasError = true
			}

			if (site.length < 2) {
				showFieldError('site')
				hasError = true
			}

			if (hasError) {
				return
			}

			form.dispatchEvent(
				new CustomEvent('studio:request-form:submit', {
					bubbles: true,
					detail: { name, phone, site }
				})
			)
			form.reset()
		})
	})
}

function feedbackPdfDownload() {
	const clickableSelector = '[data-pdf-download]'

	document.addEventListener('click', event => {
		const button = event.target.closest(clickableSelector)

		if (!button) {
			return
		}

		const pdfUrl = button.getAttribute('data-pdf')

		if (!pdfUrl) {
			return
		}

		const filename = button.getAttribute('data-pdf-filename') || ''
		const link = document.createElement('a')

		link.href = pdfUrl
		link.download = filename
		link.rel = 'noopener'
		document.body.appendChild(link)
		link.click()
		link.remove()
	})
}

feedbackPdfDownload()
initStudioRequestForm()
initStudioMethodHover()
initStudioCasesSwiper()
