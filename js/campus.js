document.addEventListener('DOMContentLoaded', function() {
    // 要素の取得
    const mapNavBtns = document.querySelectorAll('.map-nav-btn');
    const mapWrappers = document.querySelectorAll('.campus-map-wrapper');
    const buildingMarkers = document.querySelectorAll('.building-marker');
    const locationMarkers = document.querySelectorAll('.location-marker');
    const videoItems = document.querySelectorAll('.youtube-item');
    const mapAreas = document.querySelectorAll('map[name="building-1-areas"] area');
    const buildingMapAreas = document.querySelectorAll('map[name="campus-overview-areas"] area');
    const backBtn = document.querySelector('.back-btn');
    const campusOverviewMap = document.getElementById('campus-overview-map');
    const building1Map = document.getElementById('building-1-map');
    const building1MapImg = document.getElementById('building-1-map-img');
    
    // マップ切り替えボタンのクリックイベント（ボタンが存在する場合のみ）
    if (mapNavBtns.length > 0) {
        mapNavBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetMap = this.dataset.map;
                
                // すべてのボタンから active クラスを削除
                mapNavBtns.forEach(b => b.classList.remove('active'));
                
                // すべてのマップから active クラスを削除
                mapWrappers.forEach(wrapper => wrapper.classList.remove('active'));
                
                // クリックされたボタンに active クラスを追加
                this.classList.add('active');
                
                // 対応するマップに active クラスを追加
                if (targetMap === 'campus-overview') {
                    campusOverviewMap.classList.add('active');
                } else if (targetMap === 'building-1') {
                    building1Map.classList.add('active');
                }
            });
        });
    }
    
    // 建物マーカーのクリックイベント
    buildingMarkers.forEach(marker => {
        marker.addEventListener('click', function() {
            const building = this.dataset.building;
            
            // 一号館マーカーがクリックされた場合、指さしアニメーションを停止
            if (building === 'building-1') {
                this.classList.add('clicked');
            }
            
            switchToBuilding(building);
        });
    });
    
    // DXフィールドのマーカーのクリックイベント（要素が存在する場合のみ）
    const dxfieldMarker = document.querySelector('.location-marker[data-location="dxfield"]');
    if (dxfieldMarker) {
        dxfieldMarker.addEventListener('click', function() {
            const location = 'dxfield';
            highlightLocation(location);
            scrollToVideo(location);
        });
    }
    
    // 建物マップエリアのクリックイベント
    buildingMapAreas.forEach(area => {
        area.addEventListener('click', function(e) {
            e.preventDefault();
            const building = this.dataset.building;
            
            // DXフィールドの場合は動画にスクロール
            if (building === 'dxfield') {
                const location = 'dxfield';
                highlightLocation(location);
                scrollToVideo(location);
                return;
            }
            
            switchToBuilding(building);
        });
    });
    
    // 戻るボタンのクリックイベント
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            switchToCampusOverview();
        });
    }
    
    // 場所マーカーのクリックイベント
    locationMarkers.forEach(marker => {
        marker.addEventListener('click', function() {
            const location = this.dataset.location;
            highlightLocation(location);
            scrollToVideo(location);
        });
    });
    
    // 場所マップエリアのクリックイベント
    mapAreas.forEach(area => {
        area.addEventListener('click', function(e) {
            const location = this.dataset.location;
            highlightLocation(location);
            // スクロールはHTMLのanchorで行われるのでここでは不要
        });
    });
    
    // 動画アイテムにマウスオーバーした時のイベント
    videoItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const location = this.dataset.location;
            highlightMapMarker(location);
        });
        
        item.addEventListener('mouseleave', function() {
            resetMapMarkers();
        });
    });
    
    // キャンパス全体マップに切り替える関数
    function switchToCampusOverview() {
        // ナビゲーションボタンを更新（ボタンが存在する場合のみ）
        if (mapNavBtns.length > 0) {
            mapNavBtns.forEach(btn => {
                if (btn.dataset.map === 'campus-overview') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        
        // マップの表示を切り替え
        if (campusOverviewMap) {
            campusOverviewMap.classList.add('active');
        }
        if (building1Map) {
            building1Map.classList.remove('active');
        }
        
        // 一号館マーカーの指さしアニメーションを再開
        const building1Marker = document.querySelector('.building-marker[data-building="building-1"]');
        if (building1Marker) {
            building1Marker.classList.remove('clicked');
        }
    }
    
    // 建物の詳細マップに切り替える関数
    function switchToBuilding(building) {
        if (building === 'building-1') {
            // ナビゲーションボタンを更新（ボタンが存在する場合のみ）
            if (mapNavBtns.length > 0) {
                mapNavBtns.forEach(btn => {
                    if (btn.dataset.map === 'building-1') {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
            
            // マップの表示を切り替え
            if (campusOverviewMap) {
                campusOverviewMap.classList.remove('active');
            }
            if (building1Map) {
                building1Map.classList.add('active');
            }
            
            // マップエリアの座標を更新
            updateMapAreaCoords();
        }
    }
    
    // 画面サイズに合わせてマップエリアの座標を更新
    function updateMapAreaCoords() {
        if (!building1MapImg) return;
        
        const mapWidth = building1MapImg.clientWidth;
        const mapHeight = building1MapImg.clientHeight;
        
        mapAreas.forEach(area => {
            // 元のcoordsを取得
            const marker = document.querySelector(`.location-marker[data-location="${area.dataset.location}"]`);
            if (marker) {
                const x = parseInt(marker.dataset.x);
                const y = parseInt(marker.dataset.y);
                const radius = 20; // 円の半径は固定
                
                // マップのサイズに合わせて座標を計算
                const scaledX = Math.round(x * mapWidth / 800);
                const scaledY = Math.round(y * mapHeight / 400);
                const scaledRadius = Math.round(radius * mapWidth / 800);
                
                // 新しい座標をセット
                area.coords = `${scaledX},${scaledY},${scaledRadius}`;
            }
        });
    }
    
    // ウィンドウリサイズ時にマップエリアの座標を更新
    window.addEventListener('resize', updateMapAreaCoords);
    
    // 初期化時にも座標を更新
    updateMapAreaCoords();
    
    // 指定された場所を強調表示する関数
    function highlightLocation(location) {
        // すべてのマーカーとビデオのハイライトをリセット
        resetHighlights();
        
        // 対応するマーカーをハイライト
        highlightMapMarker(location);
        
        // 対応する動画をハイライト
        highlightVideo(location);
    }
    
    // マップマーカーをハイライトする関数
    function highlightMapMarker(location) {
        locationMarkers.forEach(marker => {
            if (marker.dataset.location === location) {
                marker.classList.add('active');
            }
        });
    }
    
    // 動画アイテムをハイライトする関数
    function highlightVideo(location) {
        videoItems.forEach(item => {
            if (item.dataset.location === location) {
                item.classList.add('highlight');
            }
        });
    }
    
    // すべてのハイライトをリセットする関数
    function resetHighlights() {
        resetMapMarkers();
        resetVideos();
    }
    
    // マップマーカーのハイライトをリセットする関数
    function resetMapMarkers() {
        locationMarkers.forEach(marker => {
            marker.classList.remove('active');
        });
    }
    
    // 動画アイテムのハイライトをリセットする関数
    function resetVideos() {
        videoItems.forEach(item => {
            item.classList.remove('highlight');
        });
    }
    
    // 指定された場所の動画までスクロールする関数
    function scrollToVideo(location) {
        videoItems.forEach(item => {
            if (item.dataset.location === location) {
                item.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    }
}); 