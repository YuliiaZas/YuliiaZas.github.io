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
    const modalFilterSmall = new ModalControl("aside");
    const modalGoods = new ModalGoods(json, ".modal");

    let filterRes = {};
    document.addEventListener("filter-check", function(e) { 
        filterRes[e.detail.filterName] = e.detail.filterValueArr;
        cats.filterCatalog(filterRes);
        sortBox.value = "default";
    });
    
    const sortBox = document.querySelector("#sort");
    sortBox.addEventListener("change", () => {
        let sortType = sortBox.value;
        cats.sortCatalog(sortType, filterRes);
    });

    const filterSmallControlBtn = document.querySelector(".catalog__aside-control-btn");
    filterSmallControlBtn.addEventListener("click", () => {
        modalFilterSmall.openModal();
    });

    document.addEventListener("goods-open", (e) => {
        modalGoods.openModal(e.detail.id);
    });

    document.addEventListener("goods-cart", (e) => {
        markButton(e.detail.id);
    });

    function writeToLocalStorage(id) {
        let cart = !localStorage.getItem("cart") ? [] : JSON.parse(localStorage.getItem("cart"));

        let idIndex = cart.indexOf(id);
        idIndex > -1 ? cart.splice(idIndex, 1) : cart.push(id);
        
        localStorage.setItem("cart", JSON.stringify(cart));
        console.log("localStorage", JSON.parse(localStorage.getItem("cart")));
        return JSON.parse(localStorage.getItem("cart"));
    }

    function markButton(id) {
        let cart = writeToLocalStorage(id);
        if (cart.indexOf(id) > -1) {
            document.querySelectorAll(`[data-cart="${id}"]`).forEach(btn => {
                btn.classList.add("button--active");
                btn.innerText = "В корзине";
            });
        } else {
            document.querySelectorAll(`[data-cart="${id}"]`).forEach(btn => {
                btn.classList.remove("button--active");
                btn.innerText = "В корзину";
            });
        }
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
        this.catalogBox.addEventListener("click", (e) => {
            if (e.target.classList.contains("goods__picture-img") || 
                e.target.classList.contains("goods__name")) {
                let event = new CustomEvent ("goods-open", {
                    bubbles: true,
                    detail: {id: e.target.closest(".goods").dataset.id}
                });
                this.catalogBox.dispatchEvent(event);
            } else if (e.target.classList.contains("purchase__button--goods")) {
                let eventCart = new CustomEvent ("goods-cart", {
                    bubbles: true,
                    detail: {id: e.target.closest(".goods").dataset.id}
                });
                this.catalogBox.dispatchEvent(eventCart);
            }
        });
    }
    
    filterCatalog(filterValue) {
        let resultData = null;
        let res = ( function getFilteredData(filterData, filterGroup, data) {
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
        }( filterValue, null, this.deepClone(this.catData) ) );
        this.renderCatalog(resultData);
        return res;
    }

    deepClone(data) {
        return JSON.parse(JSON.stringify(data))
    }

    sortCatalog(sortValue, filterValue) {
        let filteredData = Object.keys(filterValue).length  === 0 ? this.deepClone(this.catData) : this.filterCatalog(filterValue);

        let arr = sortValue.match(/\w+/gi);
        console.log(arr);
        let sortType = arr[0];
        let sortDirection = arr[arr.length - 1];

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
        this.renderCatalog(filteredData);
    }

    renderCatalog(data) {
        if (this.catalogBox.querySelectorAll(".goods")) {
            this.catalogBox.querySelectorAll(".goods").forEach(item => item.remove());
        };
        let cart = JSON.parse(localStorage.getItem("cart"));

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

            let isBtnActive = cart.indexOf(cat.id) > -1 ? "button--active" : "";
            let btnValue = cart.indexOf(cat.id) > -1 ? "В корзине" : "В корзину";

            let catArticleHtml = `<article class="goods" data-id="${cat.id}">
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
                <div class="purchase">
                    <div class="purchase__prices">
                        <!--div class="purchase__price--old"></div-->
                        <div class="purchase__price">${parseFloat(cat.price).toLocaleString('ru-RU')} &#8372;</div>
                    </div>
                    <button class="button purchase__button--goods ${isBtnActive}" type="button" data-cart="${cat.id}">${btnValue}</button>
                </div>
            </article>`;

            this.catalogBox.insertAdjacentHTML('beforeEnd', catArticleHtml);                                               
        })
        this.cartCatalogBtns = this.catalogBox.querySelectorAll(".purchase__button--goods");
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

        this.filterItemAllUl.addEventListener("change", (e) => {
            let event = new CustomEvent("filter-check", {
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
        let filterList = e.currentTarget;
        let filterItemAll = filterList.querySelector(".filter-item__checkbox[data-id='all']");
        let filterItems = filterList.querySelectorAll(".filter-item__checkbox:not([data-id='all'])");

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

class ModalControl {
    constructor(cssClass) {
        this.block = document.querySelector(cssClass);

        this.closeBtn = this.block.querySelector(".button--close");
        this.overlay = document.querySelector(".overlay");
        this.body = document.querySelector(".body");

        this.overlay.addEventListener("click", () => this.closeModal());
        this.closeBtn.addEventListener("click", () => this.closeModal());
        this.body.addEventListener("keyup", (e) => {
            if (e.key === "Escape") this.closeModal();
        })
    }
    openModal() {
        this.block.classList.contains("aside")
        ? this.block.classList.add("aside-small-visible")
        : this.block.classList.remove("display-none");

        this.closeBtn.classList.remove("display-none");
        this.overlay.classList.remove("display-none");
        this.body.classList.add("no-scroll");
    }
    closeModal() {
        this.block.classList.contains("aside")
        ? this.block.classList.remove("aside-small-visible")
        : this.block.classList.add("display-none");

        this.closeBtn.classList.add("display-none");
        this.overlay.classList.add("display-none");
        this.body.classList.remove("no-scroll");
    }
}
 
class ModalGoods extends ModalControl {
    constructor(dbJson, cssClass) {
        super(cssClass);

        this.dbJson = dbJson;
        this.catData = this.dbJson.cats;
        this.breedData = this.dbJson.breeds;
        this.ownerData = this.dbJson.owners;
    }

    openModal(id) {
        this.id = id;

        this.currentCat = this.catData.find(item => item.id === id);
        this.currentBreed = this.breedData.find(item => item.id === this.currentCat.breed);
        this.currentOwner = this.ownerData.find(item => item.id === this.currentCat.owner);
        
        super.openModal();
        this.renderModal(this.currentCat, this.currentBreed, this.currentOwner);
        this.createSlider();
    }

    renderModal(currentCat, currentBreed, currentOwner) {
        this.block.querySelectorAll('[data-item]').forEach(valueBox => {
            let dataSetValArr = valueBox.dataset.item.match(/(\w+)-(\w+(-\w+)*)/);
            let dataGroup = dataSetValArr ? dataSetValArr[1] : null;
            let dataValue = dataSetValArr ? dataSetValArr[2] : null;
            let currentDBItem = null;
            if (dataGroup === "cat") {
                currentDBItem = currentCat;
            } else if (dataGroup === "breed") {
                currentDBItem = currentBreed;
            } else if (dataGroup === "owner") {
                currentDBItem = currentOwner;
            }

            if (!currentDBItem || !currentDBItem[dataValue]) {
                !currentDBItem
                ? console.log(`It is not defined which database this data-item="${valueBox.dataset.item}" belongs to`)
                : console.log(`The property does not exist in current == ${dataGroup} == database`);

                valueBox.innerText = "-";
            } else {
                if ((/price/).test(dataValue)) {
                    valueBox.innerHTML = `${parseFloat(currentCat.price).toLocaleString('ru-RU')} &#8372;`
                } else if ((/link/).test(dataValue)) {
                    valueBox.setAttribute("href", `${currentDBItem[dataValue]}`);
                    valueBox.innerText = currentDBItem[dataValue].match(/@.+$/)[0];
                } else {
                    valueBox.innerText = currentDBItem[dataValue];
                }
            }
        });

        //The next should be rewrited
        let cart = JSON.parse(localStorage.getItem("cart"));
        this.cartBtn = this.block.querySelector('[data-cart]');
        let btnValue = cart.indexOf(currentCat.id) > -1 ? "В корзине" : "В корзину";
        this.cartBtn.dataset.cart = currentCat.id;
        if  (cart.indexOf(currentCat.id) > -1) {
            this.cartBtn.classList.add("button--active");
        } else {
            this.cartBtn.classList.remove("button--active");
        }
        this.cartBtn.innerText = btnValue;

        this.cartBtn.addEventListener("click", (e) => {
            let eventCart = new CustomEvent ("goods-cart", {
                bubbles: true,
                detail: {id: e.target.dataset.cart}
            });
            this.cartBtn.dispatchEvent(eventCart);
        });
    }

    createSlider() {
        return new Slider(this);
    }
}
class Slider {
    constructor(creator) {
        this.currentCat = creator.currentCat;
        this.currentBreedName = creator.currentBreed.name;
        
        this.block = creator.block.querySelector(".slider");
        
        this.sliderBoxWrapper = this.block.querySelector(".slider__wrapper");
        this.oneSlideWidth = this.sliderBoxWrapper.clientWidth;
        this.sliderBox = this.sliderBoxWrapper.querySelector(".slider__box");
        this.sliderDotsBox = this.sliderBoxWrapper.querySelector(".slider__dots");
        
        this.sliderBtns = this.block.querySelectorAll(".slider__btn");

        this.renderSlider(this.currentCat, this.currentBreedName);
        console.log(this.sliderBtns);

        this.block.addEventListener("click", (e) => {
            if (e.target.classList.contains("slider__btn")) {
                let step = e.target.dataset.step;
                console.log(step);
                this.changeSlide(step, 0);
            } else if (e.target.classList.contains("slider__dot")) {
                let index = e.target.dataset.slideInd;
                console.log(index);
                this.changeSlide(0, index);
            }
        });
    }

    renderSlider(catData, breedName) {
        let photoArr = catData.photo.large;
        let imgsAlt = `${catData.sex} ${catData.name}, ${catData.age}, породы ${breedName}, окрас: ${catData.color}. Фото`;
        this.slideoQty = photoArr.length;

        this.createImgs(photoArr, imgsAlt);
        this.createDots(this.slideoQty);
    }

    createImgs(photoArr, imgsAlt) {
        while (this.sliderBox.children.length > 0) {
            this.sliderBox.lastElementChild.remove();
        }

        photoArr.forEach((photo, i) => {
            let slide = `<div class="slider__slide" data-slide="${i + 1}">
                <img class="slider__img" src="${photo}" alt="${imgsAlt} ${i + 1}">
            </div>`;
            this.sliderBox.insertAdjacentHTML("beforeend", slide);
        });

        this.sliderBoxWrapper.style.width = `${this.oneSlideWidth}px`;
        this.sliderBox.style.width = `${this.oneSlideWidth * this.slideoQty}px`;
        this.sliderBox.style.marginLeft = `${-this.oneSlideWidth}px`;

        this.sliders = this.sliderBoxWrapper.querySelectorAll(".slider__slide");
        this.sliders.forEach(item => {
            item.style.width = `${this.oneSlideWidth}px`;
        })
    }

    getCurrentSlideNum() {
        this.sliderDots.forEach(dot => dot.classList.remove("slider__dot--active"));

        this.slidesNumArr = [];

        this.sliders.forEach(slide => this.slidesNumArr.push(slide.dataset.slide));
        // this.currentSlideNum = this.slidesNumArr[1];
        console.log("this.slidesNumArr", this.slidesNumArr);
        let currentSlideNum = this.slidesNumArr[1];
        console.log("currentSlideNum", currentSlideNum);
        this.sliderDots[currentSlideNum].classList.add("slider__dot--active");
        return currentSlideNum;
    }

    createDots(slideoQty) {
        while (this.sliderDotsBox.children.length > 0) {
            this.sliderDotsBox.lastElementChild.remove();
        }

        for (let i = 1; i <= slideoQty; i++) {
            let sliderDotHtml = `<div class="slider__dot" data-slide-ind="${i}"></div>`;
            this.sliderDotsBox.insertAdjacentHTML("beforeend", sliderDotHtml);
        }

        this.sliderDots = this.sliderDotsBox.querySelectorAll(".slider__dot");
    }

    changeSlide(step, newIndex) {
        this.currentSlideNum = this.getCurrentSlideNum();
        console.log(this.currentSlideNum);
        
        step !== 0 
        ? newIndex = +step + +this.currentSlideNum 
        : step = +newIndex + +this.currentSlideNum;
        console.log("changeSlide(step, index)",+step, +newIndex)
        this.animateMoving(+step, +newIndex);
    }
    animateMoving(step, newIndex) {
        let slidesArrForMoving = this.getSlidesArrForMoving(step, newIndex)
        this.sliderBox.style.transform = `translate(${-this.oneSlideWidth * step}px)`;
        this.sliderBox.style.transition = `transform 1.5s ease-in`;
        if (step < 0) {
            slidesArrForMoving.forEach(slide => {
                this.sliderBox.prepend(slide);
            })
            // this.sliderBox.prepend(slidesArrForMoving);
        } else {
            slidesArrForMoving.forEach(slide => {
                this.sliderBox.append(slide);
            })
            // this.sliderBox.append(slidesArrForMoving);
        }
        this.sliderBox.style.left = 0;
    }
    getSlidesArrForMoving(step, newIndex) {
        console.log("step, newIndex", step, newIndex)
        let slidesNumForMovingArr = [];
        let positionOfNewIndex = this.slidesNumArr.indexOf(newIndex);
        if (step > 0) {
			slidesNumForMovingArr = this.slidesNumArr.slice(0, positionOfNewIndex - 1);
		} else {
			slidesNumForMovingArr = this.slidesNumArr.slice(positionOfNewIndex - 1, this.slidesNumArr.length);
        }
        console.log("---slidesNumForMovingArr", slidesNumForMovingArr)
        
        let slidesArrForMoving = [];
        slidesNumForMovingArr.forEach(num => {
            console.log("=num=", num);
            console.log(this.sliderBox.querySelector(`[data-slide="${num}]"`));
            slidesArrForMoving.push(this.sliderBox.querySelector(`[data-slide="${num}"]`))
        });
        return slidesArrForMoving;
    }
    
    changeByArrows(step) {
        let currentBtn = e.currentTarget;
        console.log(currentBtn)
    }

    changeByDots(index) {

    }
}
    
