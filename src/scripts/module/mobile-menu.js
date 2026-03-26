function initMobileMenus() {
	const menus = document.querySelectorAll('[data-mob-menu]')
	if (!menus.length) return

	menus.forEach(root => {
		const toggle = root.querySelector('[data-mob-menu-toggle]')
		const panel = root.querySelector('[data-mob-menu-panel]')
		const closers = root.querySelectorAll('[data-mob-menu-close]')
		const iconUse = root.querySelector('[data-mob-menu-icon]')

		if (!toggle || !panel) return

		const openClass = root.dataset.mobMenuOpenClass || 'is-open'
		const bodyOpenClass = root.dataset.mobMenuBodyClass || 'mob-menu-open'
		const lockBody = root.dataset.mobMenuLockBody === 'true'
		const closeOnEsc = root.dataset.mobMenuCloseEsc !== 'false'
		const closeOnOutside = root.dataset.mobMenuCloseOutside !== 'false'
		const closeOnLink = root.dataset.mobMenuCloseLink === 'true'

		const closeIcon = iconUse ? iconUse.dataset.iconClose : ''
		const openIcon = iconUse ? iconUse.dataset.iconOpen : ''
		const hasIconToggle = Boolean(iconUse && closeIcon && openIcon)

		function setUseHref(value) {
			if (!iconUse || !value) return
			iconUse.setAttribute('href', value)
			iconUse.setAttribute('xlink:href', value)
		}

		function setState(open) {
			root.classList.toggle(openClass, open)
			toggle.setAttribute('aria-expanded', String(open))
			panel.setAttribute('aria-hidden', String(!open))

			if (lockBody) {
				document.body.classList.toggle(bodyOpenClass, open)
			}

			if (hasIconToggle) {
				setUseHref(open ? openIcon : closeIcon)
			}
		}

		function openMenu() {
			setState(true)
		}

		function closeMenu() {
			setState(false)
		}

		function toggleMenu() {
			const isOpen = root.classList.contains(openClass)
			if (isOpen) {
				closeMenu()
			} else {
				openMenu()
			}
		}

		toggle.addEventListener('click', event => {
			event.preventDefault()
			toggleMenu()
		})

		closers.forEach(closeBtn => {
			closeBtn.addEventListener('click', () => {
				closeMenu()
			})
		})

		if (closeOnOutside) {
			document.addEventListener('click', event => {
				if (!root.classList.contains(openClass)) return
				const target = event.target
				if (!(target instanceof Element)) return
				if (root.contains(target)) return
				closeMenu()
			})
		}

		if (closeOnEsc) {
			document.addEventListener('keydown', event => {
				if (event.key !== 'Escape') return
				if (!root.classList.contains(openClass)) return
				closeMenu()
			})
		}

		if (closeOnLink) {
			panel.querySelectorAll('a').forEach(link => {
				link.addEventListener('click', () => {
					closeMenu()
				})
			})
		}

		setState(false)
	})
}

initMobileMenus()
