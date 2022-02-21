var swiper = new Swiper('.swiper-container', {
    centeredSlides: true,
    loop: true,
    speed: 800,
    slidesPerView: 1,
    spaceBetween: 10,
    autoplay: {
        delay: 3000,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    breakpoints: {
            640: {
                slidesPerView: 2,
            },
    },
});