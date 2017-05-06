#!/usr/bin/env node
'use strict';
const fs = require('fs');
const Pdfreader = require('pdfreader');
const targetRows = require('./probes.js');
const reader = new Pdfreader.PdfReader();
const filenames = process.argv.slice(2);
const OUTPUT_FILE = 'result.csv';

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
        let row = targetRows.filter(row => row.rowName === item.text)[0];
        if(row && 0.5 >= Math.abs(item.y - items[index + 1].y)) {
            let csvColumnName = row.csvColumnName || row.rowName;
            data[csvColumnName] = data[csvColumnName] || items[index + 1].text;
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
    let pagesOfFiles = itemsOfFiles.map(mapItemsToPages);
    let dataOfFiles = pagesOfFiles.map(pageItems => {
        return pageItems.reduce((currentObject, itemsOfPage, pageIndex) => {
            let rowsOfPage = targetRows.filter(row => pageIndex + 1 === row.page);
            return Object.assign({}, currentObject, mapRowItems(itemsOfPage, rowsOfPage));
        }, {});
    });
    return new Promise(resolve => { resolve(dataOfFiles); });
})
.then(dataOfFiles => {
    let columnNames = targetRows.map(row => row.csvColumnName || row.rowName);
    let outputBuffer = '';
    outputBuffer += columnNames.join(',') + '\n';
    console.log(columnNames.join(','));
    dataOfFiles.forEach(data => {
        let rowContents = columnNames.map(columnName => data[columnName]);
        outputBuffer += rowContents.join(',') + '\n';
        console.log(rowContents.join(','));
    });
    return new Promise((resolve, reject) => {
        fs.writeFile(OUTPUT_FILE, outputBuffer, error => {
            if(error) { reject(error); }
            else {
                console.log(`\nOutput file is ${OUTPUT_FILE}.`);
                resolve(dataOfFiles);
            }
        });
    });
})
.catch(error => { console.error('error:', error); });
