function pxToRemRuntime(designPxValue, designRemBase = 10) {
	const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || designRemBase;
	return (designPxValue / designRemBase) * rootFontSize;
}

window.pxToRemRuntime = pxToRemRuntime;
