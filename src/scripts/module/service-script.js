function initServiceCasesSwiper() {
	const swiperElement = document.querySelector('.service__swiper')
	const paginationElement = document.querySelector('.service__swiper-pagination')
	const prevButton = document.querySelector('.service__swiper-prev')
	const nextButton = document.querySelector('.service__swiper-next')
	const currentSlideNode = document.querySelector('.service__swiper-current')
	const totalSlideNode = document.querySelector('.service__swiper-total')

	if (!swiperElement || !paginationElement || !prevButton || !nextButton || !currentSlideNode || !totalSlideNode || typeof Swiper === 'undefined') {
		return
	}

	const toRuntimePx = window.pxToRemRuntime || (designPxValue => designPxValue)
	const totalSlides = swiperElement.querySelectorAll('.swiper-slide').length

	if (!totalSlides) {
		return
	}

	const updateEdgeNumbers = swiperInstance => {
		const firstVisibleIndex = Math.min(swiperInstance.activeIndex, totalSlides - 1)
		const visibleSlides = Math.max(1, Math.round(Number(swiperInstance.params.slidesPerView) || 1))
		const prevNumber = firstVisibleIndex > 0 ? firstVisibleIndex : null
		const nextNumber = firstVisibleIndex + visibleSlides < totalSlides ? firstVisibleIndex + visibleSlides + 1 : null

		currentSlideNode.textContent = prevNumber === null ? '' : String(prevNumber).padStart(2, '0')
		totalSlideNode.textContent = nextNumber === null ? '' : String(nextNumber).padStart(2, '0')
	}

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
	const mobileQuery = window.matchMedia('(max-width: 768px)')
	let isMobileViewport = mobileQuery.matches
	let swiper = null

	const createSwiper = initialSlide => {
		const initialParams = getSwiperParams()

		swiper = new Swiper(swiperElement, {
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
				bulletClass: 'service__swiper-dot',
				bulletActiveClass: 'service__swiper-dot--active',
				renderBullet(index, className) {
					return `<button type="button" class="${className}" aria-label="Перейти на слайд ${index + 1}"></button>`
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

		if (typeof initialSlide === 'number' && initialSlide > 0) {
			swiper.slideTo(Math.min(initialSlide, totalSlides - 1), 0, false)
			updateEdgeNumbers(swiper)
		}
	}

	const recreateSwiper = () => {
		const currentSlide = swiper ? swiper.activeIndex : 0

		if (swiper && !swiper.destroyed) {
			swiper.destroy(true, true)
		}

		createSwiper(currentSlide)
	}

	const handleResize = () => {
		if (!swiper || swiper.destroyed) {
			return
		}

		const isMobileNow = mobileQuery.matches

		if (isMobileNow !== isMobileViewport) {
			isMobileViewport = isMobileNow
			recreateSwiper()
			return
		}

		const nextParams = getSwiperParams()
		swiper.params.slidesPerView = nextParams.slidesPerView
		swiper.params.spaceBetween = nextParams.spaceBetween
		swiper.params.breakpoints = getBreakpointParams()
		swiper.update()
		updateEdgeNumbers(swiper)
	}

	createSwiper()
	window.addEventListener('resize', handleResize)
}

function initServiceQaAccordion() {
	const accordions = document.querySelectorAll('[data-qa-accordion]')

	if (!accordions.length) {
		return
	}

	accordions.forEach((accordion, accordionIndex) => {
		const items = accordion.querySelectorAll('[data-qa-item]')

		items.forEach((item, itemIndex) => {
			const toggleButton = item.querySelector('[data-qa-toggle]')
			const answerNode = item.querySelector('[data-qa-answer]')
			const iconNode = item.querySelector('[data-qa-icon]')

			if (!toggleButton || !answerNode || !iconNode) {
				return
			}

			const answerId = answerNode.id || `service-qa-answer-${accordionIndex + 1}-${itemIndex + 1}`
			answerNode.id = answerId
			toggleButton.setAttribute('aria-controls', answerId)

			const setExpanded = isExpanded => {
				toggleButton.setAttribute('aria-expanded', String(isExpanded))
				answerNode.classList.toggle('hidden', !isExpanded)
				iconNode.classList.toggle('orange-bg', isExpanded)
				iconNode.classList.toggle('icon-black-bg', isExpanded)
			}

			const getInitialExpandedState = () => {
				if (item.hasAttribute('data-qa-open')) {
					return true
				}

				const buttonExpanded = toggleButton.getAttribute('aria-expanded')

				if (buttonExpanded === 'true' || buttonExpanded === 'false') {
					return buttonExpanded === 'true'
				}

				return !answerNode.classList.contains('hidden')
			}

			const toggleExpanded = () => {
				const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true'
				setExpanded(!isExpanded)
			}

			setExpanded(getInitialExpandedState())

			item.addEventListener('click', event => {
				const interactiveTarget = event.target.closest('a, button, input, textarea, select, label')

				if (interactiveTarget && interactiveTarget !== toggleButton) {
					return
				}

				toggleExpanded()
			})
		})
	})
}

function initServiceQaMobileToggle() {
	const accordions = document.querySelectorAll('[data-qa-accordion]')

	if (!accordions.length) {
		return
	}

	const mobileQuery = window.matchMedia('(max-width: 768px)')

	accordions.forEach(accordion => {
		const toggleWrap = accordion.querySelector('[data-qa-mobile-toggle-wrap]')
		const toggleButton = accordion.querySelector('[data-qa-mobile-toggle]')
		const labelNode = accordion.querySelector('[data-qa-mobile-toggle-label]')

		if (!toggleWrap || !toggleButton || !labelNode) {
			return
		}

		const configuredLimit = Number.parseInt(accordion.getAttribute('data-qa-mobile-limit') || '', 10)
		const visibleLimit = Number.isNaN(configuredLimit) ? 10 : Math.max(1, configuredLimit)
		const allItems = Array.from(accordion.querySelectorAll('[data-qa-item]'))
		const markedExtraItems = Array.from(accordion.querySelectorAll('[data-qa-item][data-qa-mobile-extra], [data-qa-item].desktop-only'))
		const fallbackExtraItems = allItems.slice(visibleLimit)
		const extraItems = markedExtraItems.length ? markedExtraItems : fallbackExtraItems

		if (!markedExtraItems.length) {
			fallbackExtraItems.forEach(item => {
				item.classList.add('desktop-only')
			})
		}

		if (!extraItems.length) {
			toggleWrap.classList.add('hidden')
			return
		}

		const showText = toggleButton.getAttribute('data-qa-mobile-show-text') || 'показать все'
		const hideText = toggleButton.getAttribute('data-qa-mobile-hide-text') || 'скрыть'
		let isExpanded = false

		const applyExpandedState = nextExpandedState => {
			isExpanded = nextExpandedState
			const shouldHideExtras = mobileQuery.matches && !isExpanded

			extraItems.forEach(item => {
				item.classList.toggle('hidden', shouldHideExtras)
			})

			labelNode.textContent = isExpanded ? hideText : showText
			toggleButton.setAttribute('aria-expanded', String(isExpanded))
		}

		const syncForViewport = () => {
			if (mobileQuery.matches) {
				applyExpandedState(isExpanded)
				return
			}

			extraItems.forEach(item => {
				item.classList.remove('hidden')
			})

			isExpanded = false
			labelNode.textContent = showText
			toggleButton.setAttribute('aria-expanded', 'false')
		}

		toggleButton.addEventListener('click', () => {
			if (!mobileQuery.matches) {
				return
			}

			applyExpandedState(!isExpanded)
		})

		if (typeof mobileQuery.addEventListener === 'function') {
			mobileQuery.addEventListener('change', syncForViewport)
		} else if (typeof mobileQuery.addListener === 'function') {
			mobileQuery.addListener(syncForViewport)
		}

		syncForViewport()
	})
}

function initServiceCasesShowMore() {
	const caseGrids = document.querySelectorAll('[data-cases-list], .service__case-grid')

	if (!caseGrids.length) {
		return
	}

	const mediaQuery = window.matchMedia('(max-width: 768px)')

	caseGrids.forEach(caseGrid => {
		const containerSection = caseGrid.closest('[data-cases-toggle]') || caseGrid.closest('section')
		const fallbackButton = caseGrid.nextElementSibling && caseGrid.nextElementSibling.matches('button.button--orange') ? caseGrid.nextElementSibling : null
		const toggleButton = (containerSection && containerSection.querySelector('[data-cases-toggle-button]')) || fallbackButton

		if (!containerSection || !toggleButton) {
			return
		}

		const labelNode = toggleButton.querySelector('[data-cases-toggle-label]') || toggleButton.querySelector('span')
		const items = Array.from(caseGrid.children).filter(node => node.matches('div'))

		if (!labelNode || !items.length) {
			return
		}

		const desktopLimit = Number.parseInt(containerSection.getAttribute('data-cases-desktop-limit') || '', 10) || 9
		const mobileLimit = Number.parseInt(containerSection.getAttribute('data-cases-mobile-limit') || '', 10) || 4
		const collapsedText = toggleButton.getAttribute('data-cases-collapsed-text') || labelNode.textContent.trim() || 'показать еще'
		const expandedText = toggleButton.getAttribute('data-cases-expanded-text') || 'скрыть'
		let isExpanded = false

		const getVisibleCount = () => (mediaQuery.matches ? mobileLimit : desktopLimit)

		const syncState = () => {
			const visibleCount = getVisibleCount()
			const hasOverflow = items.length > visibleCount

			items.forEach((item, index) => {
				item.classList.toggle('hidden', hasOverflow && !isExpanded && index >= visibleCount)
			})

			toggleButton.classList.toggle('hidden', !hasOverflow)
			labelNode.textContent = isExpanded ? expandedText : collapsedText
			toggleButton.setAttribute('aria-expanded', String(isExpanded))
		}

		toggleButton.addEventListener('click', () => {
			if (items.length <= getVisibleCount()) {
				return
			}

			isExpanded = !isExpanded
			syncState()
		})

		if (typeof mediaQuery.addEventListener === 'function') {
			mediaQuery.addEventListener('change', syncState)
		} else if (typeof mediaQuery.addListener === 'function') {
			mediaQuery.addListener(syncState)
		}

		syncState()
	})
}

function initServiceRequestModal() {
	const modal = document.querySelector('[data-service-request-modal]')

	if (!modal) {
		return
	}

	const openButtons = document.querySelectorAll('[data-service-request-open]')
	const closeButtons = modal.querySelectorAll('[data-service-request-close]')
	const form = modal.querySelector('[data-service-request-form]')
	const formState = modal.querySelector('[data-service-request-state="form"]')
	const successState = modal.querySelector('[data-service-request-state="success"]')
	const errorNodes = modal.querySelectorAll('[data-error-for]')
	const nameInput = form ? form.querySelector('input[name="name"]') : null

	const showFormState = () => {
		if (!formState || !successState) {
			return
		}

		formState.classList.remove('hidden')
		successState.classList.add('hidden')
	}

	const showSuccessState = () => {
		if (!formState || !successState) {
			return
		}

		formState.classList.add('hidden')
		successState.classList.remove('hidden')
	}

	const clearErrors = () => {
		errorNodes.forEach(node => {
			node.classList.add('hidden')
		})
	}

	const showError = (field, message) => {
		const node = modal.querySelector(`[data-error-for="${field}"]`)
		if (!node) {
			return
		}

		node.textContent = message
		node.classList.remove('hidden')
	}

	const isValidEmail = email => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)
	}

	const isValidPhone = phone => {
		const digits = phone.replace(/\D/g, '')
		return digits.length >= 11
	}

	const openModal = () => {
		showFormState()
		clearErrors()
		modal.classList.add('is-open')
		modal.setAttribute('aria-hidden', 'false')
		document.body.classList.add('service-request-modal-open')

		if (nameInput) {
			nameInput.focus()
		}
	}

	const closeModal = () => {
		modal.classList.remove('is-open')
		modal.setAttribute('aria-hidden', 'true')
		document.body.classList.remove('service-request-modal-open')
		showFormState()
		clearErrors()
		if (form) {
			form.reset()
		}
	}

	openButtons.forEach(button => {
		button.addEventListener('click', openModal)
	})

	closeButtons.forEach(button => {
		button.addEventListener('click', closeModal)
	})

	document.addEventListener('keydown', event => {
		if (event.key === 'Escape' && modal.classList.contains('is-open')) {
			closeModal()
		}
	})

	if (!form) {
		return
	}

	form.addEventListener('submit', event => {
		event.preventDefault()
		clearErrors()

		const formData = new FormData(form)
		const name = String(formData.get('name') || '').trim()
		const email = String(formData.get('email') || '').trim()
		const phone = String(formData.get('phone') || '').trim()
		let hasError = false

		if (name.length < 2) {
			showError('name', 'Введите имя (минимум 2 символа)')
			hasError = true
		}

		if (!isValidEmail(email)) {
			showError('email', 'Введите корректный e-mail')
			hasError = true
		}

		if (!isValidPhone(phone)) {
			showError('phone', 'Введите корректный телефон')
			hasError = true
		}

		if (hasError) {
			return
		}

		showSuccessState()
		form.reset()
	})
}

function initServiceImageLightbox() {
	const triggerImages = document.querySelectorAll('[data-image-lightbox-trigger]')

	if (!triggerImages.length) {
		return
	}

	const modal = document.createElement('div')
	modal.setAttribute('data-image-lightbox-modal', '')
	modal.setAttribute('aria-hidden', 'true')
	modal.className = 'hidden fixed w-auto h-auto flex items-center justify-center p-2 bp:p-1.6'
	modal.style.inset = '0'
	modal.style.zIndex = '2100'
	modal.style.background = '#00000099'
	modal.style.backdropFilter = 'blur(1.2rem)'
	modal.style.border = '0'

	modal.innerHTML = `
		<div class="relative z-5 w-full h-full flex items-center justify-center px-2 py-2 bp:px-1.6 bp:py-1.6 box-sizing-borderbox" data-image-lightbox-dialog role="dialog" aria-modal="true" aria-label="Image preview">
			<button type="button" data-image-lightbox-close="button" class="button--icon fixed top-2 right-2 bp:top-1.6 bp:right-1.6 z-5 " aria-label="Close image">
				<svg class="icon icon-white h-2.4 w-2.4">
					<use href="/images/svg/svgs.svg#icon-cross"></use>
				</svg>
			</button>
			<img data-image-lightbox-preview class="contain" alt="" style="width: auto; height: auto; max-width: min(140rem, 96vw); max-height: 94vh;" />
		</div>
	`

	const dialog = modal.querySelector('[data-image-lightbox-dialog]')
	const closeButton = modal.querySelector('[data-image-lightbox-close="button"]')
	const previewImage = modal.querySelector('[data-image-lightbox-preview]')

	if (!dialog || !closeButton || !previewImage) {
		return
	}

	document.body.appendChild(modal)

	let activeTrigger = null
	const bodyLockClass = 'service-request-modal-open'

	const openModal = imageNode => {
		const source = imageNode.getAttribute('data-image-lightbox-src') || imageNode.currentSrc || imageNode.src

		if (!source) {
			return
		}

		activeTrigger = imageNode
		previewImage.src = source
		previewImage.alt = imageNode.alt || ''
		modal.classList.remove('hidden')
		modal.setAttribute('aria-hidden', 'false')
		document.body.classList.add(bodyLockClass)
		closeButton.focus()
	}

	const closeModal = () => {
		if (modal.classList.contains('hidden')) {
			return
		}

		modal.classList.add('hidden')
		modal.setAttribute('aria-hidden', 'true')
		previewImage.removeAttribute('src')
		previewImage.alt = ''

		if (!document.querySelector('[data-service-request-modal].is-open')) {
			document.body.classList.remove(bodyLockClass)
		}

		if (activeTrigger && typeof activeTrigger.focus === 'function') {
			activeTrigger.focus()
		}

		activeTrigger = null
	}

	triggerImages.forEach(imageNode => {
		imageNode.style.cursor = 'zoom-in'

		if (!imageNode.hasAttribute('tabindex')) {
			imageNode.setAttribute('tabindex', '0')
		}

		if (!imageNode.hasAttribute('role')) {
			imageNode.setAttribute('role', 'button')
		}

		imageNode.setAttribute('aria-haspopup', 'dialog')

		imageNode.addEventListener('click', event => {
			event.preventDefault()
			openModal(imageNode)
		})

		imageNode.addEventListener('keydown', event => {
			if (event.key !== 'Enter' && event.key !== ' ') {
				return
			}

			event.preventDefault()
			openModal(imageNode)
		})
	})

	dialog.addEventListener('click', event => {
		if (event.target === dialog) {
			closeModal()
		}
	})

	closeButton.addEventListener('click', closeModal)

	document.addEventListener('keydown', event => {
		if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
			closeModal()
		}
	})
}

initServiceCasesSwiper()
initServiceQaAccordion()
initServiceQaMobileToggle()
initServiceCasesShowMore()
initServiceRequestModal()
initServiceImageLightbox()
