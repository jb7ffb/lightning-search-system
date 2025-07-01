import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock, Zap, Download, Building2, User, FileText, Shield, Info, AlertTriangle } from 'lucide-react';

const LightningSearchSystem = () => {
  const [currentApp, setCurrentApp] = useState('search'); // search, detail, contractor
  const [address, setAddress] = useState('');
  const [searchPeriod, setSearchPeriod] = useState('30');
  const [distanceFilter, setDistanceFilter] = useState('5');
  const [intensityFilter, setIntensityFilter] = useState('0');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [detailData, setDetailData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('general'); // general, contractor
  const [contractorInfo, setContractorInfo] = useState({
    companyName: '',
    licenseNumber: '',
    representative: '',
    customerName: '',
    customerAddress: ''
  });

  // 模擬的な落雷データ生成（デモ用）
  const generateMockLightningData = (days = 30) => {
    const data = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // 20%の確率で落雷があった日とする
      if (Math.random() < 0.2) {
        const lightningCount = Math.floor(Math.random() * 8) + 1;
        const dayData = {
          date: date.toISOString().split('T')[0],
          count: lightningCount,
          details: []
        };
        
        for (let j = 0; j < lightningCount; j++) {
          const hour = Math.floor(Math.random() * 24);
          const minute = Math.floor(Math.random() * 60);
          const distance = Math.random() * parseFloat(distanceFilter);
          const intensity = Math.floor(Math.random() * 100) + parseInt(intensityFilter);
          
          dayData.details.push({
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            distance: distance.toFixed(1),
            intensity,
            direction: ['北', '北東', '東', '南東', '南', '南西', '西', '北西'][Math.floor(Math.random() * 8)]
          });
        }
        
        dayData.details.sort((a, b) => a.time.localeCompare(b.time));
        data.push(dayData);
      }
    }
    
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // 24時間詳細データ生成（デモ用）
  const generate24HourData = () => {
    const data = [];
    const lightningCount = Math.floor(Math.random() * 15) + 5;
    
    for (let i = 0; i < lightningCount; i++) {
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      const distance = Math.random() * 5; // 5km以内
      const intensity = Math.floor(Math.random() * 100) + 20;
      
      data.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`,
        distance: distance.toFixed(2),
        intensity,
        direction: ['北', '北東', '東', '南東', '南', '南西', '西', '北西'][Math.floor(Math.random() * 8)],
        latitude: 35.6762 + (Math.random() - 0.5) * 0.1,
        longitude: 139.6503 + (Math.random() - 0.5) * 0.1
      });
    }
    
    return data.sort((a, b) => a.time.localeCompare(b.time));
  };

  // 距離別統計計算（1kmごと）
  const calculateDistanceStats = (data) => {
    const stats = {
      '1km': 0,
      '2km': 0,
      '3km': 0,
      '4km': 0,
      '5km': 0,
      total: data.length
    };

    data.forEach(item => {
      const distance = parseFloat(item.distance);
      if (distance <= 1) stats['1km']++;
      else if (distance <= 2) stats['2km']++;
      else if (distance <= 3) stats['3km']++;
      else if (distance <= 4) stats['4km']++;
      else if (distance <= 5) stats['5km']++;
    });

    return stats;
  };

  const handleSearch = async () => {
    if (!address) {
      alert('住所を入力してください');
      return;
    }

    setIsSearching(true);
    // 模擬検索（実際の実装ではBlitzortung.org APIを使用）
    setTimeout(() => {
      const results = generateMockLightningData(parseInt(searchPeriod));
      setSearchResults(results);
      setIsSearching(false);
    }, 1500);
  };

  const handleDetailSearch = async (date) => {
    setSelectedDate(date);
    setCurrentApp('detail');
    // 模擬データ生成
    const data = generate24HourData();
    setDetailData(data);
  };

  const handleContractorLogin = () => {
    setIsLoggedIn(true);
    setUserType('contractor');
  };

  const generatePDF = (isContractorVersion = false) => {
    const stats = calculateDistanceStats(detailData);
    const closestDistance = detailData.length > 0 ? Math.min(...detailData.map(d => parseFloat(d.distance))).toFixed(2) : 'なし';
    
    let pdfContent = `
落雷履歴${isContractorVersion ? '証明書' : 'レポート'}

${isContractorVersion ? '【依頼者情報】' : '【検索情報】'}
${isContractorVersion ? `依頼者名: ${contractorInfo.customerName || '未入力'}` : ''}
${isContractorVersion ? `調査地点: ${contractorInfo.customerAddress || address}` : `住所: ${address}`}
調査日時: ${new Date().toLocaleString('ja-JP')}

【調査結果】
対象日時: ${selectedDate} 24時間
検索範囲: 半径5km
落雷検知回数: ${stats.total}回
最接近距離: ${closestDistance}km

【距離別統計】（フランクリンジャパン準拠）
1km圏内: ${stats['1km']}回
2km圏内: ${stats['2km']}回
3km圏内: ${stats['3km']}回
4km圏内: ${stats['4km']}回
5km圏内: ${stats['5km']}回

${isContractorVersion ? `
【調査業者情報】
業者名: ${contractorInfo.companyName || '未入力'}
許可番号: ${contractorInfo.licenseNumber || '未入力'}
調査者: ${contractorInfo.representative || '未入力'}
発行日: ${new Date().toLocaleDateString('ja-JP')}
` : ''}

【データソースについて】
Blitzortung.org - 国際協力型雷観測ネットワーク
- 83カ国・1800局の観測ネットワーク
- 位置精度: 平均5.3km
- 検出効率: 90%以上
- 無償提供でありながら落雷発生地域の特定において高い信頼性を提供

【免責事項】
本レポートは参考情報として提供されます。
公式の防災情報は気象庁等の公的機関の情報をご利用ください。
`;

    // 実際の実装ではPDFライブラリを使用
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `落雷履歴${isContractorVersion ? '証明書' : 'レポート'}_${selectedDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 落雷日検索アプリ（一般向け無料）
  const SearchApp = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2 flex items-center justify-center gap-3">
            <Zap className="h-10 w-10" />
            落雷日検索アプリ
          </h1>
          <p className="text-purple-600 text-lg">完全無料 - 落雷があった日を簡単検索</p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                住所
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="例: 東京都千代田区丸の内1-1-1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                lang="ja"
                inputMode="text"
                autoComplete="street-address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                検索期間
              </label>
              <select
                value={searchPeriod}
                onChange={(e) => setSearchPeriod(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="7">過去7日間</option>
                <option value="30">過去30日間</option>
                <option value="90">過去90日間</option>
                <option value="365">過去1年間</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                距離フィルター
              </label>
              <select
                value={distanceFilter}
                onChange={(e) => setDistanceFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="1">1km以内</option>
                <option value="3">3km以内</option>
                <option value="5">5km以内</option>
                <option value="10">10km以内</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                強度フィルター
              </label>
              <select
                value={intensityFilter}
                onChange={(e) => setIntensityFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="0">すべて</option>
                <option value="30">弱以上</option>
                <option value="60">中以上</option>
                <option value="80">強以上</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>処理中...</>
            ) : (
              <>
                <Search className="h-5 w-5" />
                落雷日を検索
              </>
            )}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              検索結果: {searchResults.length}日間で落雷を検出
            </h2>
            
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {new Date(result.date).toLocaleDateString('ja-JP', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </h3>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {result.count}回
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    {result.details.slice(0, 4).map((detail, idx) => (
                      <div key={idx}>
                        <Clock className="h-4 w-4 inline mr-1" />
                        {detail.time} - {detail.distance}km
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleDetailSearch(result.date)}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    詳細レポートを作成
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto mt-8 text-center">
          <button
            onClick={() => setCurrentApp('detail')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mr-4"
          >
            詳細レポートアプリへ
          </button>
          <button
            onClick={() => setCurrentApp('contractor')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            業者向けサービス
          </button>
        </div>
      </div>
    </div>
  );

  // 詳細レポートアプリ
  const DetailApp = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2 flex items-center justify-center gap-3">
            <FileText className="h-10 w-10" />
            落雷詳細レポートアプリ
          </h1>
          <p className="text-blue-600 text-lg">24時間の詳細落雷データ</p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                住所
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="例: 東京都千代田区丸の内1-1-1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                lang="ja"
                inputMode="text"
                autoComplete="street-address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                対象日付
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (!address || !selectedDate) {
                alert('住所と日付を入力してください');
                return;
              }
              const data = generate24HourData();
              setDetailData(data);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Search className="h-5 w-5" />
            24時間詳細データを取得
          </button>
        </div>

        {detailData.length > 0 && (
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedDate} の落雷データ ({detailData.length}回)
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => generatePDF(false)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  基本PDF
                </button>
                {userType === 'contractor' && (
                  <button
                    onClick={() => generatePDF(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    証明書PDF
                  </button>
                )}
              </div>
            </div>

            {/* 距離別統計（1kmごと） */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">距離別統計（フランクリンジャパン準拠）</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(calculateDistanceStats(detailData)).slice(0, 5).map(([range, count]) => (
                  <div key={range} className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                    <div className="text-sm text-blue-800">{range}圏内</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 同心円地図表示エリア */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">地図表示（同心円: 1km, 2km, 3km, 4km, 5km）</h3>
              <div className="bg-gray-100 p-8 rounded-lg text-center">
                <div className="w-full h-64 bg-green-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* 同心円表示（1kmごと） */}
                  {[1, 2, 3, 4, 5].map((radius) => (
                    <div
                      key={radius}
                      className="absolute border-2 border-blue-400 rounded-full"
                      style={{
                        width: `${radius * 40}px`,
                        height: `${radius * 40}px`,
                        borderStyle: radius === 5 ? 'solid' : 'dashed'
                      }}
                    />
                  ))}
                  <div className="absolute w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="absolute top-2 left-2 text-xs text-gray-600">
                    中心点: {address}
                  </div>
                  <div className="absolute bottom-2 right-2 text-xs text-gray-600">
                    同心円: 1-5km (1kmごと)
                  </div>
                </div>
              </div>
            </div>

            {/* 詳細データテーブル */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">詳細データ</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">時刻</th>
                      <th className="border border-gray-300 p-3 text-left">距離 (km)</th>
                      <th className="border border-gray-300 p-3 text-left">強度</th>
                      <th className="border border-gray-300 p-3 text-left">方向</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3">{item.time}</td>
                        <td className="border border-gray-300 p-3">{item.distance}</td>
                        <td className="border border-gray-300 p-3">
                          <span className={`px-2 py-1 rounded text-sm ${
                            item.intensity >= 80 ? 'bg-red-100 text-red-800' :
                            item.intensity >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.intensity >= 80 ? '強' : item.intensity >= 60 ? '中' : '弱'} ({item.intensity})
                          </span>
                        </td>
                        <td className="border border-gray-300 p-3">{item.direction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto mt-8 text-center">
          <button
            onClick={() => setCurrentApp('search')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mr-4"
          >
            落雷日検索アプリへ
          </button>
          <button
            onClick={() => setCurrentApp('contractor')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            業者向けサービス
          </button>
        </div>
      </div>
    </div>
  );

  // 業者向けサービス
  const ContractorApp = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2 flex items-center justify-center gap-3">
            <Building2 className="h-10 w-10" />
            業者向けサービス
          </h1>
          <p className="text-amber-600 text-lg">電気工事業者限定 - 正式証明書作成機能</p>
        </div>

        {!isLoggedIn ? (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">業者認証</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  会社名
                </label>
                <input
                  type="text"
                  placeholder="株式会社○○電気"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電気工事業許可番号
                </label>
                <input
                  type="text"
                  placeholder="第12345号"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
            <button
              onClick={handleContractorLogin}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              認証してログイン
            </button>
            <div className="mt-4 p-4 bg-amber-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">認証について</p>
                  <p className="text-xs text-amber-700 mt-1">
                    実際の運用では電気工事業許可証の確認と管理者による承認が必要です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* 業者情報入力 */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">証明書作成情報</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">業者情報</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        会社名
                      </label>
                      <input
                        type="text"
                        value={contractorInfo.companyName}
                        onChange={(e) => setContractorInfo({...contractorInfo, companyName: e.target.value})}
                        placeholder="株式会社○○電気"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        lang="ja"
                        inputMode="text"
                        autoComplete="organization"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        許可番号
                      </label>
                      <input
                        type="text"
                        value={contractorInfo.licenseNumber}
                        onChange={(e) => setContractorInfo({...contractorInfo, licenseNumber: e.target.value})}
                        placeholder="第12345号"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        調査担当者
                      </label>
                      <input
                        type="text"
                        value={contractorInfo.representative}
                        onChange={(e) => setContractorInfo({...contractorInfo, representative: e.target.value})}
                        placeholder="田中太郎"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        lang="ja"
                        inputMode="text"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">依頼者情報</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        依頼者名
                      </label>
                      <input
                        type="text"
                        value={contractorInfo.customerName}
                        onChange={(e) => setContractorInfo({...contractorInfo, customerName: e.target.value})}
                        placeholder="山田花子"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        lang="ja"
                        inputMode="text"
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        調査地点住所
                      </label>
                      <input
                        type="text"
                        value={contractorInfo.customerAddress}
                        onChange={(e) => setContractorInfo({...contractorInfo, customerAddress: e.target.value})}
                        placeholder="東京都千代田区丸の内1-1-1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        lang="ja"
                        inputMode="text"
                        autoComplete="street-address"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 証明書プレビュー */}
            {detailData.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">証明書プレビュー</h2>
                <div className="border-2 border-gray-300 p-6 rounded-lg bg-gray-50">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">⚡ 落雷履歴証明書</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">【依頼者情報】</h4>
                      <p>依頼者名: {contractorInfo.customerName || '未入力'}</p>
                      <p>調査地点: {contractorInfo.customerAddress || address}</p>
                      <p>調査日時: {new Date().toLocaleString('ja-JP')}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">【調査結果】</h4>
                      <p>対象日時: {selectedDate} 24時間</p>
                      <p>検索範囲: 半径5km</p>
                      <p>落雷検知回数: {detailData.length}回</p>
                      <p>最接近距離: {detailData.length > 0 ? Math.min(...detailData.map(d => parseFloat(d.distance))).toFixed(2) : 'なし'}km</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">【距離別統計】（フランクリンジャパン準拠）</h4>
                    <div className="grid grid-cols-5 gap-4">
                      {Object.entries(calculateDistanceStats(detailData)).slice(0, 5).map(([range, count]) => (
                        <div key={range} className="text-center">
                          <div className="font-bold">{range}圏内: {count}回</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">【調査業者情報】</h4>
                    <p>業者名: {contractorInfo.companyName || '未入力'}</p>
                    <p>許可番号: {contractorInfo.licenseNumber || '未入力'}</p>
                    <p>調査者: {contractorInfo.representative || '未入力'}</p>
                    <p>発行日: {new Date().toLocaleDateString('ja-JP')}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">【データソースについて】</h4>
                    <p className="text-sm text-gray-600">
                      Blitzortung.org - 国際協力型雷観測ネットワーク（83カ国・1800局）<br/>
                      位置精度: 平均5.3km、検出効率: 90%以上<br/>
                      無償提供でありながら落雷発生地域の特定において高い信頼性を提供。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="max-w-4xl mx-auto mt-8 text-center">
          <button
            onClick={() => setCurrentApp('search')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mr-4"
          >
            落雷日検索アプリへ
          </button>
          <button
            onClick={() => setCurrentApp('detail')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            詳細レポートアプリへ
          </button>
        </div>

        {/* 重要な注意事項 */}
        <div className="max-w-4xl mx-auto mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">重要な注意事項</h4>
              <p className="text-sm text-yellow-700 mt-1">
                本サービスはBlitzortung.orgの非商用利用規約に完全準拠しています。
                証明書機能は無償付加価値サービスとして提供され、直接的な課金は一切行いません。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AppSwitcher = () => {
    switch (currentApp) {
      case 'search':
        return <SearchApp />;
      case 'detail':
        return <DetailApp />;
      case 'contractor':
        return <ContractorApp />;
      default:
        return <SearchApp />;
    }
  };

  return <AppSwitcher />;
};

export default LightningSearchSystem;
