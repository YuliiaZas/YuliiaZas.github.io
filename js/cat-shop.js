// $.ajaxSetup({
//     async: false
// });
// receiveData = (json, dataName) => {
//     let resData = null;
//     $.getJSON(json, (data => {
//         resData = data[dataName];
//     }));
//     return resData;
// };
// receiveIdArr = (inputData) => {
//     let resArr = [];
//     for (let item of inputData) {
//         resArr.push(item.id);
//     };
//     return resArr;
// };
// let catData = receiveData("json/cat-data.json", "cats");
// // let catIdArr = receiveIdArr(catData);
// let breedData = receiveData("json/breed-data.json", "breeds");
// let ownerData = receiveData("json/owner-data.json", "owners");


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
    class Shop {
        constructor(cssSelector) {
            this.cssSelector = cssSelector;
            this.createShop();
        }
        createShop() {

        }
    }

    class Catalog1 {
        constructor(dbJson, cssSelector, filterData, sortType) {
            this.dbJson = dbJson;
            this.catData = this.dbJson.cats;
            this.breedData = this.dbJson.breeds;
            this.ownerData = this.dbJson.owners;
            this.cssSelector = cssSelector;
            this.renderCatalog();
        }
        
        filterCatalog(filterData, filterGroup) {
            // console.log(filterValue);
            //to get filteredData from cloned catData
            // function getFilteredData(data, filterData) {
                // if (Array.isArray(filterData)) {
                //     return filterData.forEach(filterItem => {
                //         data.filter(item => {
    
                //         });
                //     })
                // } else {
                //     let res = null;
                //     for (let filterGroup of Object.values(filterData)) {
                //         res = getFilteredData(filterGroup);
                //     }
                //     return res;
                // }
  
                
            // }
            let data = JSON.parse(JSON.stringify(this.catData));
            (function getFilteredData(filterData, filterGroup, data) {
                let res = null;
                if (Array.isArray(filterData)) {
                    return data.filter(item => {
                        if (filterData.includes("all")) {
                            return item;
                        } else {
                            return filterData.includes(item[filterGroup]);
                        }
                    });
                } else {
                    for (let filterGroup in filterData) {
                        if (res === null) {
                            res = data;
                        }
                        res = getFilteredData(filterData[filterGroup], filterGroup, res);
                    }
                    console.log(res);
                    return res;
                }
            }(filterData, filterGroup, data))

            // let filteredData = JSON.parse(JSON.stringify(this.catData)).filter(item => {

            // });
            // let filteredData = getFilteredData(filterValue)
            // let itemsArr = [];

            // this.catData
            // this.renderCatalog(itemsArr);
            // return filteredData;
        }
        
        // renderCatalog(filterCatalog(filterValue))
        // renderCatalog(sortCatalog(sortType, filterCatalog(filterValue)))

        sortCatalog(sortType, filteredData) {
            // console.log(sortType);
            //to get sortedData from filteredData (from cloned catData)
            let sortedData = [];
            //to get itemsArr
            // let itemsArr = [];
            // this.renderCatalog(itemsArr);
            return sortedData;
        }

        renderCatalog(data) {
            // itemsArr.forEach(() => {

            // });
            console.log(this.dbJson);
            console.log(this.catData);
            console.log(this.breedData);
            console.log(this.ownerData);
        }

        openModalWindow(e) {

        }

        writeToCookies(e) {

        }
    }

    

    class Filter {
        constructor(dbJson, cssSelector) {
            this.dbJson = dbJson;
            this.catData = this.dbJson.cats;
            this.breedData = this.dbJson.breeds;
            this.cssSelector = cssSelector;
            this.filterItemAllLi = document.querySelector(this.cssSelector);
            this.render();
            this.filterItemAllLi.addEventListener('change', this.checkItems);
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

                    this.filterItemAllLi.insertAdjacentHTML('beforeEnd', filerLetterGroup);
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

                    this.filterItemAllLi.insertAdjacentHTML('beforeEnd', filterItems);
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

            if (e.target !== filterItemAll) {
                if (isEveryFiltersSelected) {
                    filterItemAll.checked = true;
                    filterItems.forEach(item => item.checked = false);
                } else if (isSomeFilterSelected) {
                    filterItemAll.checked = false;
                } else {
                    filterItemAll.checked = true;
                }
            } else if (e.target === filterItemAll) {
                filterItemAll.checked = true;
                filterItems.forEach(item => item.checked = false);
            }
        }
    }

    const cats = new Catalog1(json, ".catalog");
    const breedFilter = new Filter(json, ".filter__group-list--breed");
    const sexFilter = new Filter(json, ".filter__group-list--sex");
    // let testFilter = new Filter(json, ".filter__group-list--large");

    const filtersBox = document.querySelector(".filter");
    // let filterValue = {};
    function getFilterValue() {
        let filterValue = {};
        let filtersCheckboxes = filtersBox.querySelectorAll(".filter-item__checkbox");
        filtersCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                filterValue[checkbox.dataset.filter] ?
                filterValue[checkbox.dataset.filter].push(checkbox.dataset.id) :
                filterValue[checkbox.dataset.filter] = [(checkbox.dataset.id)];
            }
        });
        console.log(filterValue);
        return filterValue;
    }
    filtersBox.onchange = (e) => {
        cats.filterCatalog(getFilterValue());
        // cats.renderCatalog(cats.filterCatalog(getFilterValue()));
    };
    

    const sortBox = document.querySelector("#sort");
    sortBox.onchange = () => {
        let sortType = sortBox.value;
        // getFilterValue();
        // cats.sortCatalog(sortType, cats.filterCatalog(getFilterValue()));
        cats.renderCatalog(cats.sortCatalog(sortType, cats.filterCatalog(getFilterValue())));
        console.log(sortBox.value);
    }
    // onchange:
    // cats.sortCatalog(sortType);

    // btn onclick

})
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

//     renderCatalog () {
//         console.log(this.catIdArr);
//         this.catalogBlock.find(".goods").remove(); //clear catalog before filter result rendering 
//         $.each(this.catIdArr, i => {
//             console.log("======")
//             this.addCatInfo(this.catIdArr[i])
//         });
//     }

//     addCatInfo(id) {
//         let cat = null;
//         $.each(this.catData, (i, item) => {
//             if (item.id === id) {
//                 cat = this.catData[i];
//             }
//         });
//         let catBreedName = null;
//         $.each(this.breedData, (i, item) => {
//             if (item.id === cat.breed) {
//                 catBreedName = this.breedData[i].name;
//             }
//         });
//         let catOwner = null;
//         $.each(this.ownerData, (i,item) => {
//             if (item.id === cat.owner) {
//                 catOwner = this.ownerData[i];
//             }
//         });
//         let catOwnerHtml = `<a class="goods__picture-owner" href="${catOwner["unsplash-link"]}" target="_blank">by ${catOwner.name}</a>`;

//         let catPhotosSmallArr = [];
//         // $.each(cat.photo, (i,group) => { //use this when imgs will be added
//         //     if ("small" in group) {
//         //         catPhotosSmallArr = group.small;
//         //     }
//         // });
//         $.each(cat.photo, (i,group) => {
//             if ("large" in group) {
//                 catPhotosSmallArr = group.large;
//             }
//         });
//         let catImgAlt = `${cat.sex} ${cat.name}, ${cat.age}, ${cat.color}`;
//         let catImgsHtml = `<img class="goods__picture-img" src="${catPhotosSmallArr[0]}" alt="${catImgAlt}">`;
//         if (catPhotosSmallArr.length > 1) {
//             catImgsHtml += `
//             <img class="goods__picture-img" src="${catPhotosSmallArr[1]}" alt="${catImgAlt}">`;
//         }

//         let currentCat = `<article class="goods">
//             <div class="goods__id">${cat.id}</div>
//             <div class="goods__picture-wrapper">
//                 ${catImgsHtml}
//                 ${catOwnerHtml}
//             </div>
//             <div class="goods__description">
//                 <div class="goods__name">${cat.name}</div>
//                 <div class="goods__breed">${catBreedName}</div>
//                 <div class="goods__character">
//                     <span class="goods__sex">${cat.sex},</span>
//                     <span class="goods__age">${cat.age}</span>
//                 </div>  
//             </div>
//             <hr>
//             <div class="goods__footer">
//                 <div class="goods__prices">
//                     <!--div class="goods__old-price"></div-->
//                     <div class="goods__price">${cat.price} грн.</div>
//                 </div>
//                 <button class="button button--goods" type="button">В корзину</button>
//             </div>
//         </article>`;
//         $(currentCat).appendTo(this.catalogBlock);
//     }

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
