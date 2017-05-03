#!/usr/bin/env node
'use strict';
const Pdfreader = require('pdfreader');
const reader = new Pdfreader.PdfReader();
const filenames = process.argv.slice(2);
const targetRows = ['姓名', '性別', '出生日期'];

const mapItemsToPages = (items) => {
    let pagingItems = items
    .map((item, index) => { if(item.page) { return {page: item.page, index: index}; } })
    .filter(item => !!item);
    return pagingItems.map((item, index) => {
        return items.slice(item.index + 1, items[index].index);
    });
};
const mapRowItems = (items = [], targetRows = []) => {
    let data = {};
    items.forEach((item, index) => {
        if(-1 != targetRows.indexOf(item.text) && !data[item.text]) {
            data[item.text] = items[index + 1].text;
        }
    });
    return data;
};
const readfilePromise = (filename) => {
    return new Promise((resolve, reject) => {
        const items = [];
        reader.parseFileItems(filename, function(err, item) {
            if(err) {
                reject(err);
            } else if(!item) {
                resolve(items);
            } else { items.push(item); }
        });
    });
};

Promise.all(filenames.map(readfilePromise))
.then(itemsOfFiles => {
    let dataOfFiles = itemsOfFiles.map(items => { return mapRowItems(items, targetRows); });
    return new Promise(resolve => { resolve(dataOfFiles); });
})
.then(dataOfFiles => {
    console.log(dataOfFiles);
    return new Promise(resolve => { resolve(dataOfFiles); });
})
.catch(error => { console.log('error:', error); });
