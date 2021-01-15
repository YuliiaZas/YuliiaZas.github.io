const getData = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        let errorDiv = document.createElement('div');
        errorDiv.innerHTML = 'База данных сейчас не доступна. Попробуйте зайти на сайт позже.';
        document.querySelector(".catalog").prepend(errorDiv);
        throw new Error (`Couldn't fetch ${url}, status ${res.status}`);
    }
    return await res.json();
}

getData("json/bd.json").then(function(json) {
    const cats = new Catalog(json, ".catalog__content");
    const breedFilter = new Filter(json, ".filter__group-list--breed");
    const sexFilter = new Filter(json, ".filter__group-list--sex");

    const sortBox = document.querySelector("#sort");

    let filterRes = {};
    document.addEventListener("filter-check", function(e) { 
        filterRes[e.detail.filterName] = e.detail.filterValueArr;
        cats.filterCatalog(filterRes);
        sortBox.value = "default";
    });

    sortBox.onchange = () => {
        let sortType = sortBox.value;
        cats.sortCatalog(sortType, filterRes);
    }
})

class Catalog {
    constructor(dbJson, cssSelector) {
        this.dbJson = dbJson;
        this.catData = this.dbJson.cats;
        this.breedData = this.dbJson.breeds;
        this.ownerData = this.dbJson.owners;
        this.catalogBox = document.querySelector(cssSelector);
        this.renderCatalog(this.catData);
    }
    
    filterCatalog(filterValue) {
        let resultData = null;
        let res = (function getFilteredData(filterData, filterGroup, data) {
            if (Array.isArray(filterData)) {
                return data.filter(item => {
                    return (filterData.includes("all")) ? item : 
                        filterData.includes(item[filterGroup]);
                });
            } else {
                for (let filterGroup in filterData) {
                    if (resultData === null) { resultData = data; }
                    resultData = getFilteredData(filterData[filterGroup], filterGroup, resultData);
                }
                console.log(resultData);
                return resultData;
            }
        }(filterValue, null, JSON.parse(JSON.stringify(this.catData))));
        this.renderCatalog(resultData);
        return res;
    }


    sortCatalog(sortValue, filterValue) {
        let filteredData = Object.keys(filterValue).length  === 0 ? JSON.parse(JSON.stringify(this.catData)) : this.filterCatalog(filterValue);

        let arr = sortValue.match(/\w+/gi);
        console.log(arr);
        let sortType = arr[0];
        let sortDirection = arr[arr.length - 1];

        if (sortType === "default") {
            return filteredData;
        } else {
            if (sortType === "age") {
                filteredData.forEach(item => {
                    item.ageYear = (/мес/i).test(item.age) ? parseInt(item.age) / 12 : parseInt(item.age);
                });
                sortType = "ageYear";
            }
            if (sortDirection === "ascend"){
                filteredData.sort((a, b) => {
                    return parseInt(a[sortType])  > parseInt(b[sortType]) ? 1 : -1;
                });
            } else if (sortDirection === "descend") {
                filteredData.sort((b, a) => {
                    return parseInt(a[sortType]) > parseInt(b[sortType]) ? 1 : -1;
                });
            }
        }
        this.renderCatalog(filteredData);
    }

    renderCatalog(data) {
        if (this.catalogBox.querySelectorAll(".goods")) {
            this.catalogBox.querySelectorAll(".goods").forEach(item => item.remove());
        };

        data.forEach(cat => {
            let catBreed = this.breedData.find(item => item.id === cat.breed);
            let catOwner = this.ownerData.find(item => item.id === cat.owner);
            let catOwnerHtml = `<a class="goods__picture-owner" href="${catOwner["unsplash-link"]}" target="_blank">by ${catOwner.name}</a>`;
            
            let catPhotosSmallArr = cat.photo.large;
            let catImgAlt = `${cat.sex} ${cat.name}, ${cat.age}, ${cat.color}`;
            let catImgsHtml = `<img class="goods__picture-img" src="${catPhotosSmallArr[0]}" alt="${catImgAlt}">`;
            if (catPhotosSmallArr.length > 1) {
                catImgsHtml += `
                <img class="goods__picture-img" src="${catPhotosSmallArr[1]}" alt="${catImgAlt}">`;
            }

            let catArticleHtml = `<article class="goods">
                <div class="goods__id">${cat.id}</div>
                <div class="goods__picture-wrapper">
                    ${catImgsHtml}
                    ${catOwnerHtml}
                </div>
                <div class="goods__description">
                    <div class="goods__name">${cat.name}</div>
                    <div class="goods__breed">${catBreed.name}</div>
                    <div class="goods__character">
                        <span class="goods__sex">${cat.sex},</span>
                        <span class="goods__age">${cat.age}</span>
                    </div>  
                </div>
                <hr>
                <div class="goods__footer">
                    <div class="goods__prices">
                        <!--div class="goods__old-price"></div-->
                        <div class="goods__price">${cat.price} грн.</div>
                    </div>
                    <button class="button button--goods" type="button">В корзину</button>
                </div>
            </article>`;

            this.catalogBox.insertAdjacentHTML('beforeEnd', catArticleHtml)                                                    
        })

    }
}


class Filter {
    constructor(dbJson, cssSelector) {
        this.dbJson = dbJson;
        this.catData = this.dbJson.cats;
        this.breedData = this.dbJson.breeds;
        this.cssSelector = cssSelector;
        this.filterItemAllUl = document.querySelector(this.cssSelector);
        this.render();

        this.filterItemAllUl.addEventListener('change', (e) => {
            var event = new CustomEvent("filter-check", {
                bubbles: true,
                detail: {
                    filterName: e.target.dataset.filter,
                    filterValueArr: this.checkItems(e)
                }
            });
            this.filterItemAllUl.querySelector(".filter-item__checkbox").dispatchEvent(event);
        });
    }

    render() {
        const filterType = this.cssSelector.replace(/.+--/,"");

        // "breed" filter is unique - it contains groups.
        // other filters (including "sex") may be created 
        // in simpler way - w/o groups (see else if)
        if (filterType === "breed") {
            let breedFirstLetters = [];
            let breedNames = [];
            this.breedData.forEach(breed => {
                if (!breedFirstLetters.includes(breed.name[0])) {
                    breedFirstLetters.push(breed.name[0])
                }
                breedNames.push(breed.name);
            });
            breedFirstLetters.sort();
            breedNames.sort();

            breedFirstLetters.forEach(letter => {
                let filerItemsInGroup = "";
                breedNames.forEach(breedName => {
                    if (breedName[0] === letter) {
                        let appropBreed = this.breedData.find(breed => breed.name === breedName);
                        filerItemsInGroup += `<li class="filter-item">
                            <label class="filter-item__label">
                                <input class="filter-item__checkbox" type="checkbox" data-filter="${filterType}" data-id="${appropBreed.id}">
                                <span class="filter-item__label-name">${appropBreed.name}</span>
                            </label>
                        </li>
                        `
                    }
                })

                let filerLetterGroup = `<li class="filter-items">
                    <span class="filter-letter">${letter}</span>
                    <ul>
                        ${filerItemsInGroup}
                    </ul>
                </li>`;

                this.filterItemAllUl.insertAdjacentHTML('beforeEnd', filerLetterGroup);
            });
        // } else if (filterType === "sex") {
        // Object.keys(this.catData[0]).includes(filterType) &&
        } else if (typeof this.catData[0][filterType] === 'string') {
            let filterItemsArr = [];
            this.catData.forEach(cat => {
                if(!filterItemsArr.includes(cat[filterType])) {
                    filterItemsArr.push(cat[filterType]);
                }
            });
            filterItemsArr.sort();

            filterItemsArr.forEach(filterItem => {
                let filterItems = `<li class="filter-item">
                    <label class="filter-item__label">
                        <input class="filter-item__checkbox" type="checkbox" data-filter="${filterType}" data-id="${filterItem}">
                        <span class="filter-item__label-name">${filterItem}</span>
                    </label>
                </li>`;

                this.filterItemAllUl.insertAdjacentHTML('beforeEnd', filterItems);
            })
        } else {
            console.log("filterType is not valid");
        }
    }

    checkItems(e) {
        //check-uncheck checkboxes (in consideration of "all" checkbox)
        //to receive filter array (for one filter group)
        
        let filterItemAll = e.currentTarget.querySelector(".filter-item__checkbox[data-id='all']");
        let filterItems = e.currentTarget.querySelectorAll(".filter-item__checkbox:not([data-id='all'])");

        let isSomeFilterSelected = false;
        let isEveryFiltersSelected = null;
        
        filterItems.forEach(item => {
            if (item.checked) {
                isSomeFilterSelected = true;
                if (isEveryFiltersSelected === null || isEveryFiltersSelected) {
                    isEveryFiltersSelected = true;
                }
            } else {
                isEveryFiltersSelected = false;
            }
        });

        let filterValueArr = [];
        
        if (e.target !== filterItemAll && isSomeFilterSelected && !isEveryFiltersSelected) {
            filterItemAll.checked = false;
            filterItems.forEach(item => {
                if (item.checked) filterValueArr.push(item.dataset.id);
            })
        } else {
            filterItemAll.checked = true;
            filterValueArr = ["all"];
            filterItems.forEach(item => item.checked = false);
        }

        console.log(filterValueArr);
        return filterValueArr;
    }
}

    
    // let testFilter = new Filter(json, ".filter__group-list--large");

    // const filtersBox = document.querySelector(".filter");
    // // let filterValue = {};
    // function getFilterValue() {
    //     let filterValue = {};
    //     let filtersCheckboxes = filtersBox.querySelectorAll(".filter-item__checkbox");
    //     filtersCheckboxes.forEach(checkbox => {
    //         if (checkbox.checked) {
    //             filterValue[checkbox.dataset.filter] ?
    //                 filterValue[checkbox.dataset.filter].push(checkbox.dataset.id) :
    //                 filterValue[checkbox.dataset.filter] = [(checkbox.dataset.id)];
    //         }
    //     });
    //     console.log(filterValue);
    //     return filterValue;
    // }
    // filtersBox.onchange = (e) => {
    //     cats.filterCatalog(getFilterValue());
    //     // cats.renderCatalog(cats.filterCatalog(getFilterValue()));
    // };
    

    // const sortBox = document.querySelector("#sort");
    // sortBox.onchange = () => {
    //     let sortType = sortBox.value;
    //     // getFilterValue();
    //     // cats.sortCatalog(sortType, cats.filterCatalog(getFilterValue()));
    //     cats.renderCatalog(cats.sortCatalog(sortType, cats.filterCatalog(getFilterValue())));
    //     console.log(sortBox.value);
    // }
    // onchange:
    // cats.sortCatalog(sortType);

    // btn onclick


// getData("json/bd.json").then((data) => {
//     console.log(data);
// })



// class Catalog {
//     constructor(cssClass, catIdArr, catData, breedData, ownerData) {
//         this.catalogBlock = $(cssClass);
//         this.catIdArr = catIdArr;
//         this.catData = catData;
//         this.breedData = breedData;
//         this.ownerData = ownerData;
//         this.renderCatalog();
//         this.writeToLacalStorage();
//         this.createEvents();
//     }

    // renderCatalog () {
    //     console.log(this.catIdArr);
    //     this.catalogBlock.find(".goods").remove(); //clear catalog before filter result rendering 
    //     $.each(this.catIdArr, i => {
    //         console.log("======")
    //         this.addCatInfo(this.catIdArr[i])
    //     });
    // }

    // addCatInfo(id) {
    //     let cat = null;
    //     $.each(this.catData, (i, item) => {
    //         if (item.id === id) {
    //             cat = this.catData[i];
    //         }
    //     });
    //     let catBreedName = null;
    //     $.each(this.breedData, (i, item) => {
    //         if (item.id === cat.breed) {
    //             catBreedName = this.breedData[i].name;
    //         }
    //     });
    //     let catOwner = null;
    //     $.each(this.ownerData, (i,item) => {
    //         if (item.id === cat.owner) {
    //             catOwner = this.ownerData[i];
    //         }
    //     });
    //     let catOwnerHtml = `<a class="goods__picture-owner" href="${catOwner["unsplash-link"]}" target="_blank">by ${catOwner.name}</a>`;

    //     let catPhotosSmallArr = [];
    //     // $.each(cat.photo, (i,group) => { //use this when imgs will be added
    //     //     if ("small" in group) {
    //     //         catPhotosSmallArr = group.small;
    //     //     }
    //     // });
    //     $.each(cat.photo, (i,group) => {
    //         if ("large" in group) {
    //             catPhotosSmallArr = group.large;
    //         }
    //     });
    //     let catImgAlt = `${cat.sex} ${cat.name}, ${cat.age}, ${cat.color}`;
    //     let catImgsHtml = `<img class="goods__picture-img" src="${catPhotosSmallArr[0]}" alt="${catImgAlt}">`;
    //     if (catPhotosSmallArr.length > 1) {
    //         catImgsHtml += `
    //         <img class="goods__picture-img" src="${catPhotosSmallArr[1]}" alt="${catImgAlt}">`;
    //     }

    //     let currentCat = `<article class="goods">
    //         <div class="goods__id">${cat.id}</div>
    //         <div class="goods__picture-wrapper">
    //             ${catImgsHtml}
    //             ${catOwnerHtml}
    //         </div>
    //         <div class="goods__description">
    //             <div class="goods__name">${cat.name}</div>
    //             <div class="goods__breed">${catBreedName}</div>
    //             <div class="goods__character">
    //                 <span class="goods__sex">${cat.sex},</span>
    //                 <span class="goods__age">${cat.age}</span>
    //             </div>  
    //         </div>
    //         <hr>
    //         <div class="goods__footer">
    //             <div class="goods__prices">
    //                 <!--div class="goods__old-price"></div-->
    //                 <div class="goods__price">${cat.price} грн.</div>
    //             </div>
    //             <button class="button button--goods" type="button">В корзину</button>
    //         </div>
    //     </article>`;
    //     $(currentCat).appendTo(this.catalogBlock);
    // }

//     writeToLacalStorage() {
//         let goodsItems = this.catalogBlock.find(".goods");
//         let goodsArr = [];
//         $.each(goodsItems, (i, goodsItem) => {
//             let id = $(goodsItem).children(".goods__id").html();
//             let name = $(goodsItem).find(".goods__name").html();
//             goodsArr.push({
//                 "id": id,
//                 "name": name
//             });
//         });
//         localStorage.setItem("cats", JSON.stringify(goodsArr));
//         console.log("localStorage", JSON.parse(localStorage.getItem("cats")));
//     }

//     writeToCookies(e) {
//         let goodsItemId = $(e.currentTarget).find(".goods__id").text();
//         $.cookie.json = true;
//         let goodsArr = $.cookie("viewed_items");
//         let isItemExistsInGoodsArr = false;
//         if (!Array.isArray(goodsArr)) {
//             goodsArr = [];
//             goodsArr.push({
//                 [goodsItemId]: 1
//             });
//         } else {
//             $.each(goodsArr, (i,item) => {
//                 if (goodsItemId in item) {
//                     item[goodsItemId]++;
//                     isItemExistsInGoodsArr = true;
//                 }
//             });
//             if (!isItemExistsInGoodsArr) {
//                 goodsArr.push({[goodsItemId]: 1});
//             }
//         }
//         $.cookie("viewed_items", goodsArr);
//         console.log("viewed_items", $.cookie("viewed_items"));   
//     }

//     createEvents() {
//         this.catalogBlock.children(".goods").click(this.writeToCookies);
//     }
// };
// let catalog = null;







// class BreedFilter {
//     constructor(cssClass, breedData, catData) {
//         this.filterBlock = $(cssClass);
//         this.breedData = breedData;
//         this.catData = catData;
//         this.renderBreedFilter();
//         this.getCatsIdsArr();
//         this.createFilterEvents();
//     }

//     renderBreedFilter() {
//         let filterData = []; //[{letterObj1},{letterObj2},...]
//         let lettersArr = []; //[firstLetter1, firstLetter2,...]
//         let letterObj = {}; //{letter: firstLetter, ids: [breed.id1,breed.id2,...], names: [breed.name1,breed.name2,...]}
//         $(this.breedData).each((i, item) => {
//             let firstLetter = item.name[0];
//             let firstLetterIndex = lettersArr.indexOf(firstLetter);
//             if (firstLetterIndex === -1) {
//                 lettersArr.push(firstLetter);

//                 letterObj = {
//                     letter: firstLetter,
//                     ids: [item.id],
//                     names: [item.name]
//                 };
//                 filterData.push(letterObj);
//             } else if (firstLetterIndex > -1) {
//                 filterData[firstLetterIndex].ids.push(item.id);
//                 filterData[firstLetterIndex].names.push(item.name);
//             }
//         });
//         let lettersSortedArr = [...lettersArr].sort();

//         console.log("🚀 ~ filterData", filterData);
//         console.log("🚀 ~ lettersArr", lettersArr)
//         console.log("🚀 ~ lettersSortedArr", lettersSortedArr)

//         $(lettersSortedArr).each((i, letter) => {
//             let filterListTemplate = "";
//             let letterDataIndex = lettersArr.indexOf(letter);

//             $(filterData[letterDataIndex].ids).each((index, breedId) => {
//                 let breedName = filterData[letterDataIndex].names[index];
//                 let filterItemTemplate = ` <li class="aside-part__item">
//                     <a href="#" class="aside-part__link">
//                         <input type="checkbox" class="aside-part__checkbox" id="aside-part-${breedId}">
//                         <label class="aside-part__label" for="aside-part-${breedId}">${breedName}</label>
//                     </a>
//                 </li>`;
//                 filterListTemplate += filterItemTemplate;

//                 let allFilterItemTemplate = `<li class="aside-part__item  aside-part__item--all">
//                     <span class="aside-part__label aside-part__label--all aside-part__label--all-item" >${breedName}</span>
//                 </li>`;
//                 this.filterBlock.find(".aside-part__list--all").append(allFilterItemTemplate);
//             });

//             let filterLetterTemplate = `<li class="aside-part__letter" data-letter="${letter}">
//                 <a href="#" class="aside-part__link">${letter}</a>
//                 <ul class="aside-part__list">
//                     ${filterListTemplate}
//                 </ul>
//             </li>`;
//             this.filterBlock.append(filterLetterTemplate);
//         });
//     }

//     toggleFilterLetters (e) {
//         if ($(e.target).prop("tagName") === "A" ||
//             $(e.target).hasClass("aside-part__label--all")) {
//             e.preventDefault();
//         }
//         let isToggleAllowed = true;
//         if (e.target.closest(".aside-part__item") !== null ||
//             $(e.target).hasClass("aside-part__checkbox--all")) {
//             isToggleAllowed = false;
//         }
//         if (isToggleAllowed) {
//             $(e.currentTarget).find(".aside-part__list").slideToggle(100);
//         }
//     }

//     checkBreeds(e) {
//         let isBreedSelected = false;
//         this.filterBlock.find(".aside-part__item:not(.aside-part__item--all)").each((i, item) => {
//             if ($(item).find(".aside-part__checkbox").prop("checked")) {
//                 isBreedSelected = true;
//             }
//         });
//         if (isBreedSelected) {
//             this.filterBlock.find(".aside-part__checkbox--all").prop("checked", false);
//         } else {
//             this.filterBlock.find(".aside-part__checkbox--all").prop("checked", true);
//         }

//         if (e && $((e.currentTarget)).hasClass("aside-part__checkbox--all")) {
//             this.filterBlock.find(".aside-part__checkbox--all").prop("checked", true);
//             this.filterBlock.find(".aside-part__item:not(.aside-part__item--all)").each((i, item) => {
//                 $(item).find(".aside-part__checkbox").prop("checked", false);
//             });
//         }
//     }
    
//     getCatsIdsArr() {
//         let breedIdForRenderArr = [];
//         this.filterBlock.find(".aside-part__checkbox").each((i, item) => {
//             if ($(item).prop("checked")) {
//                 breedIdForRenderArr.push(item.id.slice(9, item.id.length));
//             }
//         });
//         console.log(breedIdForRenderArr);
//         let catsIdsArr = [];
//         $(breedIdForRenderArr).each((i,item) => {
//             if (item === "t-all") {
//                 $(this.catData).each((index,cat) => {
//                         catsIdsArr.push(cat.id);
//                 });
//             } else {
//                 $(this.catData).each((index,cat) => {
//                     if (cat.breed === item) {
//                         catsIdsArr.push(cat.id);
//                     }
//                 });
//             }
//         });
//         console.log(catsIdsArr);
//         catalog = new Catalog(".catalog", catsIdsArr, catData, breedData, ownerData);
//         return catsIdsArr;
//     }

//     createFilterEvents() {
//         this.filterBlock.children(".aside-part__letter").click(this.toggleFilterLetters);
//         this.filterBlock.find(".aside-part__item:not(.aside-part__item--all)").click((e) => {
//             this.checkBreeds(e);
//             this.getCatsIdsArr();
//         });
//         this.filterBlock.find(".aside-part__checkbox--all").click((e) => {
//             this.checkBreeds(e);
//             this.getCatsIdsArr();
//         });
//     }
// }
// let filter = new BreedFilter(".aside-part__filter", breedData, catData);
