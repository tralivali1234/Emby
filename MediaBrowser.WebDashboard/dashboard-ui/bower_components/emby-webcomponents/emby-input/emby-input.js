﻿define(['layoutManager', 'browser', 'css!./emby-input'], function (layoutManager, browser) {

    var EmbyInputPrototype = Object.create(HTMLInputElement.prototype);

    function getLabel(input) {
        var elem = input.previousSibling;
        while (elem && elem.tagName != 'LABEL') {
            elem = elem.previousSibling;
        }
        return elem;
    }

    function onFocus(e) {
        var label = getLabel(this);
        if (label) {
            label.classList.add('inputLabelFocused');
            label.classList.remove('inputLabelUnfocused');
        }
    }

    function onBlur(e) {
        var label = getLabel(this);
        if (label) {
            label.classList.add('inputLabelUnfocused');
            label.classList.remove('inputLabelFocused');
        }
    }

    EmbyInputPrototype.createdCallback = function () {

        var parent = this.parentNode;
        if (!parent.classList.contains('inputContainer')) {
            var div = this.ownerDocument.createElement('div');
            div.classList.add('inputContainer');
            parent.replaceChild(div, this);
            div.appendChild(this);
        }
        if (!this.id) {
            this.id = 'input' + new Date().getTime();
        }

        this.removeEventListener('focus', onFocus);
        this.removeEventListener('blur', onBlur);

        this.addEventListener('focus', onFocus);
        this.addEventListener('blur', onBlur);
    };

    EmbyInputPrototype.attachedCallback = function () {

        if (this.getAttribute('data-embyinput') != 'true') {
            this.setAttribute('data-embyinput', 'true');

            var label = this.ownerDocument.createElement('label');
            label.innerHTML = this.getAttribute('label') || '';
            label.classList.add('inputLabel');
            label.classList.add('inputLabelUnfocused');
            label.htmlFor = this.id;
            this.parentNode.insertBefore(label, this);

            var div = document.createElement('div');
            div.classList.add('emby-input-selectionbar');
            this.parentNode.insertBefore(div, this.nextSibling);
        }
    };

    document.registerElement('emby-input', {
        prototype: EmbyInputPrototype,
        extends: 'input'
    });
});