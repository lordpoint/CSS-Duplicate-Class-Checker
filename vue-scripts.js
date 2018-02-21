new Vue({
  
    el: '#app',
        data: {
            fileUploaded: false,
            dupes: [],
            styles: [],
            results: [],
            reduced: false,
            reducedBy: 0
        },
        methods: {
            handleFiles(event) {
                if (document.getElementById('file-input').files[0].type === 'text/css') {
                    this.fileUploaded = true;
                    let input = event.target;
                    let reader = new FileReader();
                    let self = this;
                    
                    reader.onload = function(){
                        // Get contents of uploaded .css file
                        let output = reader.result;
                        output = output.replace(/\r?\n|\r/g, '');
                        output = self.removeMediaQueries(output);
                        output = self.removeComments(output);

                        let output_arr = output.split("}");
                        let css_vals = [];

                        // Split CSS into two arrays: names and styles
                        for (let i = 0; i < output_arr.length - 1; i++) {
                            // create 2-item array, where index 0 is the css selector and index 1 is the styles
                            let nameValuePair = output_arr[i].split("{");
                            let valArray = [nameValuePair[0]];
                            // Catch extraneous hard returns or extra blank spaces that might throw a false positive
                            if (nameValuePair.length > 1) {
                                let strippedStyles = nameValuePair[1].replace(/\s/g,'');
                                let styles = [];
                                // Is it a multi-line style (with ;'s in it) or a single line style (without a ;)?
                                if (strippedStyles.indexOf(';') > -1) {
                                    styles = strippedStyles.split(";");
                                    // And... if it's a long style and the last item has a ; - remove the empty item
                                    // created by this final ;
                                    if (styles[styles.length - 1] == '') {
                                        styles.pop();
                                    }
                                } else {
                                    styles.push(strippedStyles);
                                } 
                                valArray.push(styles);
                                css_vals.push(valArray);
                            }
                        }
                        // Alphabetize CSS values within their respective classes in order to make comparison easier
                        self.alphabetizeStyles(css_vals);
                    }; 
                    reader.readAsText(input.files[0]);
                } else {
                    alert(
                        "C'mon, breh! You uploaded a " +
                        document.getElementById('file-input').files[0].type +
                        " file. This only works with .css files"
                    );
                    return;
                }
            },

            alphabetizeStyles(vals) {
                for (let i = 1; i < vals.length; i++) {
                    vals[i].sort(function(a, b) {
                        return b - a;
                    })
                }
                this.sortDescending(vals);
            },

            sortDescending(vals) {
                vals.sort(function(a, b) {
                    return b[1].length - a[1].length;
                })
                this.checkForDupes(vals)
            },

            checkForDupes(vals) {
                // Look at each class individually
                for (let thisClass = 0; thisClass < vals.length - 1; thisClass++) {
                    let thisDupe = [vals[thisClass][0]];
                    let dupeStyles = vals[thisClass][1];
                    let removeIfDupeFound = [thisClass];

                    // Compare each class to every following class
                    for (let compClass = thisClass + 1; compClass < vals.length; compClass++) {
                        // If they are the same length, then compare the styles
                        if (vals[thisClass][1].length === vals[compClass][1].length) {
                            let isMatch = true
                            for (let thisStyle = 0; thisStyle < vals[thisClass].length; thisStyle++) {
                                // The moment we reach a non-matching style, we know it's not a match 
                                // (since all styles are alphabetized) so we can go on to the next compClass
                                if (vals[thisClass][1][thisStyle] !== vals[compClass][1][thisStyle]) {
                                    isMatch = false;
                                    break;
                                }
                            }
                            if (isMatch == true) { 
                                thisDupe.push(vals[compClass][0])
                                removeIfDupeFound.push(compClass)
                            }
                        } else if (vals[thisClass][1].length > vals[compClass][1].length) {
                            // Since the css classes have been sorted in descending order of length (by sortDescending() above)
                            // then we can break if we reach a compClass that is longer than thisClass, since they can not possibly
                            // match and all following compClasses are guaranteed to be shorter as well
                            break;
                        }
                    }

                    // Once the above for-loop is complete, we will have compared the 'thisClass' to all other classes
                    // and added the class name to 'thisDupe' if a match was found. Next we push the set of matches contained in
                    // 'thisDupe' to a global collection of all duplicates called 'dupes' then remove the duplicate classes from the
                    // main array so they don't get caught again. 
                    if (thisDupe.length > 1) { 
                        this.dupes.push(thisDupe);
                        if (dupeStyles.length == 0) { 
                            dupeStyles.push('** Style Empty **') 
                        }
                        this.styles.push(dupeStyles);
                        for (let i = removeIfDupeFound.length - 1; i >= 0; i--) {
                            let indexToRemove = removeIfDupeFound[i];
                            vals.splice(indexToRemove, 1);
                        }
                    }
                }
                this.compileResults();
            },

            compileResults() {
                for (let i = 0; i < this.dupes.length; i++) {
                    this.results.push({
                        id: i,
                        name: this.dupes[i],
                        styles: this.styles[i]
                    })
                }
            },

            removeMediaQueries(css) {
                let startLength = css.length;
                let cleaned_css = css.replace(/@.*}}/, '');
                let endLength = cleaned_css.length;

                let percentReduction = ((startLength - endLength)/startLength) * 100;
                if (percentReduction > 0) {
                    this.reducedBy = percentReduction.toFixed(0);
                    this.reduced = true;
                }
                return cleaned_css;
            },

            removeComments(css) {
                return css.replace(/(?!<\")\/\*[^\*]+\*\/(?!\")/g, '');
            },

            reset() {
                this.dupes = [];
                this.styles = [];
                this.results = [];
                this.fileUploaded = false;
                this.reduced = false;
                this.reducedBy = 0;
            }
        }
    })
