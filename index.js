#!/usr/bin/env node
'use strict';
const Pdfreader = require('pdfreader');
const reader = new Pdfreader.PdfReader();
const filenames = process.argv.slice(2);
const targetRows = [
    {rowName: '姓名', page: 1, csvColumnName: '姓名 (p1)'},
    {rowName: '姓名', page: 5, csvColumnName: '姓名 (p5)'},
    {rowName: '性別', page: 1},
    {rowName: '出生日期', page: 1},
];

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
        if(row) {
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
    let dataOfFiles = pagesOfFiles.map((pageItems, pageIndex) => {
        return pageItems.reduce((currentObject, itemsOfPage, index) => {
            let rowsOfPage = targetRows.filter(row => index + 1 === row.page);
            return Object.assign({}, currentObject, mapRowItems(itemsOfPage, rowsOfPage));
        }, {});
    });
    return new Promise(resolve => { resolve(dataOfFiles); });
})
.then(dataOfFiles => {
    let columnNames = targetRows.map(row => row.csvColumnName || row.rowName);
    console.log(columnNames.join(';,;'));
    dataOfFiles.forEach(data => {
        let rowContents = columnNames.map(columnName => data[columnName]);
        console.log(rowContents.join(';,;'));
    });
    return new Promise(resolve => { resolve(dataOfFiles); });
})
.catch(error => { console.log('error:', error); });
