/*
 * The MIT License (MIT)
 * Copyright (c) 2013 Lance Campbell. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, regexp: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    // --- Required modules ---
    var PreferencesManager  = brackets.getModule("preferences/PreferencesManager"),
        Menus               = brackets.getModule("command/Menus"),
        EditorManager       = brackets.getModule("editor/EditorManager"),
        CommandManager      = brackets.getModule("command/CommandManager"),
        AppInit             = brackets.getModule("utils/AppInit"),
        DocumentManager     = brackets.getModule("document/DocumentManager"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils");
    
    // --- Constants ---
    var COMMAND_NAME    = "Toggle Ruler",
        COMMAND_ID      = "lkcampbell.toggle-ruler",
        SHORTCUT_KEY    = "Ctrl-Alt-R";
    
    var MAX_COLUMNS     = 80;
    
    // --- Local variables ---
    var _defPrefs       = { enabled: false },
        _prefs          = PreferencesManager.getPreferenceStorage(module, _defPrefs),
        _viewMenu       = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU),
        _rulerHTML      = require("text!ruler-template.html"),
        $rulerPanel     = null;
    
    var _templateFunctions = {
        "rulerNumber": function () {
            var i           = 0,
                finalHTML   = '';
            
            for (i = 10; i <= MAX_COLUMNS; i += 10) {
                finalHTML += '                ';
                finalHTML += '<td class="number" colspan="9">';
                finalHTML += i;
                finalHTML += '</td>';
                
                if (i !== MAX_COLUMNS) {
                    finalHTML += '\n';
                    finalHTML += '                ';
                    finalHTML += '<td class="number"></td>';
                    finalHTML += '\n';
                }
            }
            return finalHTML;
        },
        "rulerTickMark": function () {
            var i           = 0,
                finalHTML   = '';
            
            for (i = 0; i <= MAX_COLUMNS; i++) {
                finalHTML += '                ';
                
                if (i % 5) {
                    // Minor tick mark
                    finalHTML += '<td class="minor-tick-mark" id="';
                    finalHTML += i;
                    finalHTML += '">|</td>';
                } else {
                    // Major tick mark
                    finalHTML += '<td class="major-tick-mark" id="';
                    finalHTML += i;
                    finalHTML += '">|</td>';
                }
                
                if (i !== MAX_COLUMNS) {
                    finalHTML += '\n';
                }
            }
            return finalHTML;
        }
    };
    
    // --- Private Functions ---
    function _createRuler() {
        console.log("Called _createRuler()...");
        $rulerPanel = $(Mustache.render(_rulerHTML, _templateFunctions));
        $("#editor-holder").before($rulerPanel);
    }
    
    function _showRuler() {
        console.log("Called _showRuler()...");
        if ($rulerPanel.is(":hidden")) {
            $rulerPanel.show();
        }
        EditorManager.resizeEditor();
    }
    
    function _hideRuler() {
        console.log("Called _hideRuler()...");
        if ($rulerPanel.is(":visible")) {
            $rulerPanel.hide();
        }
        EditorManager.resizeEditor();
    }
    
    // --- Event handlers ---
    function _updateRuler() {
        console.log("Called _updateRuler()...");
        // *****TODO**** MIGHT need a call to EditorManager.resizeEditor() later on
    }
    
    function _toggleRuler() {
        var command         = CommandManager.get(COMMAND_ID),
            rulerEnabled    = !command.getChecked();
        
        console.log("Called _toggleRuler()...");
        
        command.setChecked(rulerEnabled);
        _prefs.setValue("enabled", rulerEnabled);
        
        if (rulerEnabled) {
            _showRuler();
        } else {
            _hideRuler();
        }
    }
    
    // --- Initialize Extension ---
    AppInit.appReady(function () {
        var rulerEnabled = _prefs.getValue("enabled");
        
        // Register command
        CommandManager.register(COMMAND_NAME, COMMAND_ID, _toggleRuler);
        
        // Add to View menu
        if (_viewMenu) {
            _viewMenu.addMenuItem(COMMAND_ID, SHORTCUT_KEY);
        }
        
        // Apply user preferences
        CommandManager.get(COMMAND_ID).setChecked(rulerEnabled);
        
        // Add event listeners for updating the ruler
        $(DocumentManager).on("currentDocumentChange", _updateRuler);
        
        // *****TODO**** Need an event listener for font size adjustment
        // *****TODO**** MIGHT need an event listener for horizontal scroll
        // *****TODO**** MIGHT need an event listener for addition of characters
        //               What fires off when the column number increases?
        
        // Load the ruler CSS -- when done, create the ruler UI
        ExtensionUtils.loadStyleSheet(module, "ruler.css")
            .done(function () {
                _createRuler();
                _updateRuler();
                
                if (rulerEnabled) {
                    _showRuler();
                } else {
                    _hideRuler();
                }
            });
    });
});
