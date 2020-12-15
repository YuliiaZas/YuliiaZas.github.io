$.ajaxSetup({
    async: false
});
receiveData = (json, dataName) => {
    let resData = null;
    $.getJSON(json, (data => {
        resData = data[dataName];
    }));
    return resData;
};
// receiveIdArr = (inputData) => {
//     let resArr = [];
//     for (let item of inputData) {
//         resArr.push(item.id);
//     };
//     return resArr;
// };
let catData = receiveData("json/cat-data.json", "cats");
// let catIdArr = receiveIdArr(catData);
let breedData = receiveData("json/breed-data.json", "breeds");
let ownerData = receiveData("json/owner-data.json", "owners");


class Catalog {
    constructor(cssClass, catIdArr, catData, breedData, ownerData) {
        this.catalogBlock = $(cssClass);
        this.catIdArr = catIdArr;
        this.catData = catData;
        this.breedData = breedData;
        this.ownerData = ownerData;
        this.renderCatalog();
        this.writeToLacalStorage();
        this.createEvents();
    }

    renderCatalog () {
        this.catalogBlock.find(".goods").remove(); //clear catalog before filter result rendering 
        $.each(this.catIdArr, i => {
            this.addCatInfo(this.catIdArr[i])
        });
    }

    addCatInfo(id) {
        let cat = null;
        $.each(this.catData, (i, item) => {
            if (item.id === id) {
                cat = this.catData[i];
            }
        });
        let catBreedName = null;
        $.each(this.breedData, (i, item) => {
            if (item.id === cat.breed) {
                catBreedName = this.breedData[i].name;
            }
        });
        let catOwner = null;
        $.each(this.ownerData, (i,item) => {
            if (item.id === cat.owner) {
                catOwner = this.ownerData[i];
            }
        });
        let catOwnerHtml = `<a class="picture__owner" href="${catOwner["unsplash-link"]}" target="_blank">by ${catOwner.name}</a>`;

        let catPhotosSmallArr = [];
        // $.each(cat.photo, (i,group) => { //use this when imgs will be added
        //     if ("small" in group) {
        //         catPhotosSmallArr = group.small;
        //     }
        // });
        $.each(cat.photo, (i,group) => {
            if ("large" in group) {
                catPhotosSmallArr = group.large;
            }
        });
        let catImgAlt = `${cat.sex} ${cat.name}, ${cat.age}, ${cat.color}`;
        let catImgsHtml = `<img class="picture__img" src="${catPhotosSmallArr[0]}" alt="${catImgAlt}">`;
        if (catPhotosSmallArr.length > 1) {
            catImgsHtml += `
            <img class="picture__img" src="${catPhotosSmallArr[1]}" alt="${catImgAlt}">`;
        }

        let currentCat = `<article class="catalog__goods goods">
            <div class="goods__id">${cat.id}</div>
            <div class="goods__picture picture">
                ${catImgsHtml}
                ${catOwnerHtml}
            </div>
            <div class="goods__description description">
                <div class="description__name">${cat.name}</div>
                <div class="description__breed">${catBreedName}</div>
                <div class="description__character">
                    <span class="description__sex">${cat.sex},</span>
                    <span class="description__age">${cat.age}</span>
                </div>  
            </div>
            <div class="goods__price price">
                <span class="price__value">${cat.price} грн.</span>
                <button class="price__btn" type="button">В корзину</button>
            </div>
        </article>`;
        $(currentCat).appendTo(this.catalogBlock);
    }

    writeToLacalStorage() {
        let goodsItems = this.catalogBlock.find(".goods");
        let goodsArr = [];
        $.each(goodsItems, (i, goodsItem) => {
            let id = $(goodsItem).children(".goods__id").html();
            let name = $(goodsItem).find(".description__name").html();
            goodsArr.push({
                "id": id,
                "name": name
            });
        });
        localStorage.setItem("cats", JSON.stringify(goodsArr));
        console.log("localStorage", JSON.parse(localStorage.getItem("cats")));
    }

    writeToCookies(e) {
        let goodsItemId = $(e.currentTarget).find(".goods__id").text();
        $.cookie.json = true;
        let goodsArr = $.cookie("viewed_items");
        let isItemExistsInGoodsArr = false;
        if (!Array.isArray(goodsArr)) {
            goodsArr = [];
            goodsArr.push({
                [goodsItemId]: 1
            });
        } else {
            $.each(goodsArr, (i,item) => {
                if (goodsItemId in item) {
                    item[goodsItemId]++;
                    isItemExistsInGoodsArr = true;
                }
            });
            if (!isItemExistsInGoodsArr) {
                goodsArr.push({[goodsItemId]: 1});
            }
        }
        $.cookie("viewed_items", goodsArr);
        console.log("viewed_items", $.cookie("viewed_items"));   
    }

    createEvents() {
        this.catalogBlock.children(".goods").click(this.writeToCookies);
    }
};
let catalog = null;







class BreedFilter {
    constructor(cssClass, breedData, catData) {
        this.filterBlock = $(cssClass);
        this.breedData = breedData;
        this.catData = catData;
        this.renderBreedFilter();
        this.getCatsIdsArr();
        this.createFilterEvents();
    }

    renderBreedFilter() {
        let filterData = []; //[{letterObj1},{letterObj2},...]
        let lettersArr = []; //[firstLetter1, firstLetter2,...]
        let letterObj = {}; //{letter: firstLetter, ids: [breed.id1,breed.id2,...], names: [breed.name1,breed.name2,...]}
        $(this.breedData).each((i, item) => {
            let firstLetter = item.name[0];
            let firstLetterIndex = lettersArr.indexOf(firstLetter);
            if (firstLetterIndex === -1) {
                lettersArr.push(firstLetter);

                letterObj = {
                    letter: firstLetter,
                    ids: [item.id],
                    names: [item.name]
                };
                filterData.push(letterObj);
            } else if (firstLetterIndex > -1) {
                filterData[firstLetterIndex].ids.push(item.id);
                filterData[firstLetterIndex].names.push(item.name);
            }
        });
        let lettersSortedArr = [...lettersArr].sort();

        console.log("🚀 ~ filterData", filterData);
        console.log("🚀 ~ lettersArr", lettersArr)
        console.log("🚀 ~ lettersSortedArr", lettersSortedArr)

        $(lettersSortedArr).each((i, letter) => {
            let filterListTemplate = "";
            let letterDataIndex = lettersArr.indexOf(letter);

            $(filterData[letterDataIndex].ids).each((index, breedId) => {
                let breedName = filterData[letterDataIndex].names[index];
                let filterItemTemplate = ` <li class="aside-part__item">
                    <a href="#" class="aside-part__link">
                        <input type="checkbox" class="aside-part__checkbox" id="aside-part-${breedId}">
                        <label class="aside-part__label" for="aside-part-${breedId}">${breedName}</label>
                    </a>
                </li>`;
                filterListTemplate += filterItemTemplate;

                let allFilterItemTemplate = `<li class="aside-part__item  aside-part__item--all">
                    <span class="aside-part__label aside-part__label--all aside-part__label--all-item" >${breedName}</span>
                </li>`;
                this.filterBlock.find(".aside-part__list--all").append(allFilterItemTemplate);
            });

            let filterLetterTemplate = `<li class="aside-part__letter" data-letter="${letter}">
                <a href="#" class="aside-part__link">${letter}</a>
                <ul class="aside-part__list">
                    ${filterListTemplate}
                </ul>
            </li>`;
            this.filterBlock.append(filterLetterTemplate);
        });
    }

    toggleFilterLetters (e) {
        if ($(e.target).prop("tagName") === "A" ||
            $(e.target).hasClass("aside-part__label--all")) {
            e.preventDefault();
        }
        let isToggleAllowed = true;
        if (e.target.closest(".aside-part__item") !== null ||
            $(e.target).hasClass("aside-part__checkbox--all")) {
            isToggleAllowed = false;
        }
        if (isToggleAllowed) {
            $(e.currentTarget).find(".aside-part__list").slideToggle(100);
        }
    }

    checkBreeds(e) {
        let isBreedSelected = false;
        this.filterBlock.find(".aside-part__item:not(.aside-part__item--all)").each((i, item) => {
            if ($(item).find(".aside-part__checkbox").prop("checked")) {
                isBreedSelected = true;
            }
        });
        if (isBreedSelected) {
            this.filterBlock.find(".aside-part__checkbox--all").prop("checked", false);
        } else {
            this.filterBlock.find(".aside-part__checkbox--all").prop("checked", true);
        }

        if (e && $((e.currentTarget)).hasClass("aside-part__checkbox--all")) {
            this.filterBlock.find(".aside-part__checkbox--all").prop("checked", true);
            this.filterBlock.find(".aside-part__item:not(.aside-part__item--all)").each((i, item) => {
                $(item).find(".aside-part__checkbox").prop("checked", false);
            });
        }
    }
    
    getCatsIdsArr() {
        let breedIdForRenderArr = [];
        this.filterBlock.find(".aside-part__checkbox").each((i, item) => {
            if ($(item).prop("checked")) {
                breedIdForRenderArr.push(item.id.slice(9, item.id.length));
            }
        });
        console.log(breedIdForRenderArr);
        let catsIdsArr = [];
        $(breedIdForRenderArr).each((i,item) => {
            if (item === "all") {
                $(this.catData).each((index,cat) => {
                        catsIdsArr.push(cat.id);
                });
            } else {
                $(this.catData).each((index,cat) => {
                    if (cat.breed === item) {
                        catsIdsArr.push(cat.id);
                    }
                });
            }
        });
        catalog = new Catalog(".catalog", catsIdsArr, catData, breedData, ownerData);
        return catsIdsArr;
    }

    createFilterEvents() {
        this.filterBlock.children(".aside-part__letter").click(this.toggleFilterLetters);
        this.filterBlock.find(".aside-part__item:not(.aside-part__item--all)").click((e) => {
            this.checkBreeds(e);
            this.getCatsIdsArr();
        });
        this.filterBlock.find(".aside-part__checkbox--all").click((e) => {
            this.checkBreeds(e);
            this.getCatsIdsArr();
        });
    }
}
let filter = new BreedFilter(".aside-part__filter", breedData, catData);
