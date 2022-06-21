const DEBUG_ENABLED = false;
const hljs = require('highlight.js/lib/common');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const { time } = require('console');

/**
 * Mapping of the input docs
 */
var docs = [
    'so_rust_1.html','so_js_1.html','so_math_1.html','py_docs_1.html',
    'py_docs_2.html','cpp_ref_1.html'
];


var times = [];
var search_times = [];
var pred_times = [];
var elements = [];
var total_elements = 0;
const ITERATIONS=10

const pre_docs = [
    'py_docs_1.html','py_docs_2.html','cpp_ref_1.html','cpp_ref_2.html','web3_rtd.html','reddit_c.html'
]


const pre_code_docs = [
    'so_rust_1.html','so_js_1.html','so_math_1.html'
]

function parseFile(file_name){
    var data = fs.readFileSync(`raw_inputs/${file_name}`, 'utf8')
    const dom = new JSDOM(data);

    var selector;
    if (pre_code_docs.includes(file_name)) {
        selector = 'pre code';
    } else if (pre_docs.includes(file_name)){
        selector = 'pre';
    }else {
        console.err(`Unknown ${file_name}`);
        
        return [null,null,null];
    }

    var full_start = Date.now();
    var div_list = dom.window.document.querySelectorAll(selector);
    var search_time = Date.now()-full_start
    var pred_time = 0

    var div_array = [...div_list];
    if (DEBUG_ENABLED) {
        console.log(`\n\n---------------------------------------------`);
        console.log(`${file} --> ${div_list.length}`);
    }
    for (var i = 0; i < div_array.length; i++) {
        
        var start = Date.now();
        const highlighted_code = hljs.highlightAuto(div_array[i].textContent);
        pred_time+=  Date.now()-start;
        if (DEBUG_ENABLED) {
            console.log(div_array[i].textContent);
            console.log(`${highlighted_code.language}\n`);
        }
    }
    return [div_array.length,Date.now()-full_start, search_time,pred_time];
}

for (var iter_num = 0; iter_num < ITERATIONS; iter_num++) {
    console.log(`Iteration ${iter_num}/${ITERATIONS}`)
    var elements_in_iter = 0;
    for (const file of pre_code_docs.concat(pre_docs)) {
        var [found, full,parse,pred] = parseFile(file);
        times.push(full);
        elements_in_iter+=found;
        search_times.push(parse);
        pred_times.push(pred);
        total_elements+=found;
        // console.log(times.length);
    }
    elements.push(elements_in_iter);
}
var total_time = times.reduce((a,b)=>a+b);
var total_search = search_times.reduce((a,b)=>a+b);
var total_pred = pred_times.reduce((a,b)=>a+b);
console.log(`\n\n${elements[0]} total spans`)

console.log('\n-----------------------\nNET:'); 
console.log(`Average time: ${total_time/ITERATIONS} ms`);
console.log(`Average time per span: ${(total_time/total_elements).toFixed(2)} ms`);
console.log('\n-----------------------\nSearch:'); 
console.log(`Average time: ${total_search/ITERATIONS} ms`);
console.log(`Average time per span: ${(total_search/total_elements).toFixed(2)} ms`);
console.log('\n-----------------------\nPred:'); 
console.log(`Average time: ${total_pred/ITERATIONS} ms`);
console.log(`Average time per span: ${(total_pred/total_elements).toFixed(2)} ms`);


var docs_with_label = new Map();
docs_with_label.set('py_docs_1.html','python');
docs_with_label.set('py_docs_2.html','python');
docs_with_label.set('so_js_1.html','javascript');
docs_with_label.set('so_rust_1.html','rust');
docs_with_label.set('cpp_ref_1.html','cpp');
docs_with_label.set('cpp_ref_2.html','cpp');
docs_with_label.set('web3_rtd.html','javascript');
docs_with_label.set('reddit_c.html','cpp');


var total = 0;
var correct = 0;
for (const [file,lang] of docs_with_label) {
    var data = fs.readFileSync(`raw_inputs/${file}`, 'utf8')
    const dom = new JSDOM(data);
    var full_start = Date.now();
    var div_list = dom.window.document.querySelectorAll('pre');
    var div_array = [...div_list];
    for (var i = 0; i < div_array.length; i++) {
        
        const highlighted_code = hljs.highlightAuto(div_array[i].textContent);
        total++;
        if (lang == 'python'){
            // console.log(highlighted_code.language);
            correct+=highlighted_code.language=='python'||highlighted_code.language=='python-repl';
        } else if (lang=='cpp'){
            correct+=highlighted_code.language=='cpp'||highlighted_code.language=='c';
        }else{
            correct+=highlighted_code.language==lang;
        }
    }
}
console.log('\n--------------------------')
console.log(`ACC=${(correct/total*100).toFixed(2)}%`);
