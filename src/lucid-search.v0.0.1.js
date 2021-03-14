(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["lucidSearch"] = factory();
	else
		root["lucidSearch"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/examples/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/examples/index.js":
/*!*******************************!*\
  !*** ./src/examples/index.js ***!
  \*******************************/
/*! exports provided: findMatchesNormalized, findMatchesHtmlNormalized, findMatchesHtml, findMatches */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"findMatchesNormalized\", function() { return findMatchesNormalized; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"findMatchesHtmlNormalized\", function() { return findMatchesHtmlNormalized; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"findMatchesHtml\", function() { return findMatchesHtml; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"findMatches\", function() { return findMatches; });\nconst defaultOptions = { el: 'span', cssClass: 'matched' };\nconst split = /[.\\-_\\s]/;\n\nfunction normalize(string) {\n    return string\n        .replace(/a|æ|ä|å|á|à|ã|â|ā/gi, '[aæäåáàãâā]')\n        .replace(/c|ç|č|ć/gi, '[cçčć]')\n        .replace(/e|é|ê|è|ë|ē|ė/gi, '[eéêèëēė]')\n        .replace(/i|î|ï|í|ī|ì/gi, '[iîïíīì]')\n        .replace(/o|œ|ö|ó|õ|ô|ò|ø|ō/gi, '[oœöóõôòøō]')\n        .replace(/s|ś|š|ß/gi, '[sśšß]')\n        .replace(/u|ü|ù|ú|ŭ|ū|û/gi, '[uüùúŭūû]');\n}\n\nfunction findHTML(haystack, needles, options) {\n    let newHaystack = haystack;\n\n    const {\n        el,\n        cssClass,\n    } = options;\n\n    const matches = needles.map((n) => {\n        if (!n) return null;\n        return haystack.match(new RegExp(`(${n})(?!([^<]+)?>)`, 'gi'));\n    }).flat().filter(d => d !== null);\n\n    newHaystack = newHaystack.replace(\n        new RegExp(\n            `(${matches.join('|')})(?!([^<]+)?>)`, 'gi',\n        ),\n        s => `<${el} class=\"${cssClass}\">${s}</${el}>`,\n    );\n\n    return {\n        matches,\n        mark: matches.length > 0\n            ? newHaystack\n            : haystack,\n    };\n}\n\nfunction find(haystack, needles, options) {\n    let newHaystack = haystack;\n\n    const {\n        el,\n        cssClass,\n    } = options;\n\n    const matches = needles.map((n) => {\n        if (!n) return null;\n        return haystack.match(new RegExp(n, 'gi'));\n    }).flat().filter(d => d !== null);\n\n    newHaystack = newHaystack.replace(\n        new RegExp(matches.join('|'), 'gi'),\n        s => `<${el} class=\"${cssClass}\">${s}</${el}>`,\n    );\n\n    return {\n        matches,\n        mark: matches.length > 0\n            ? newHaystack\n            : haystack,\n    };\n}\n\nfunction findMatchesNormalized(haystack, needle, options = defaultOptions) {\n    const needles = normalize(needle).split(split);\n\n    return find(haystack, needles, options);\n}\n\nfunction findMatchesHtmlNormalized(haystack, needle, options = defaultOptions) {\n    const needles = normalize(needle).split(split);\n\n    return findHTML(haystack, needles, options);\n}\n\nfunction findMatchesHtml(haystack, needle, options = defaultOptions) {\n    const needles = needle.split(split);\n\n    return findHTML(haystack, needles, options);\n}\n\nfunction findMatches(haystack, needle, options = defaultOptions) {\n    const needles = needle.split(split);\n\n    return find(haystack, needles, options);\n}\n\n\n//# sourceURL=webpack://lucidSearch/./src/examples/index.js?");

/***/ })

/******/ });
});