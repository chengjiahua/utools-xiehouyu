import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import './index.css'

const defaultData = [
  {
    id: 1,
    riddle: '小葱拌豆腐',
    answer: '一清二白',
    explanation: '比喻清清楚楚，明明白白。也指非常清白，没有污点。'
  },
  {
    id: 2,
    riddle: '哑巴吃黄连',
    answer: '有苦说不出',
    explanation: '比喻有苦难言，无法诉说自己的委屈或痛苦。'
  },
  {
    id: 3,
    riddle: '竹篮打水',
    answer: '一场空',
    explanation: '比喻白费力气，没有成果，劳而无功。'
  },
  {
    id: 4,
    riddle: '芝麻开花',
    answer: '节节高',
    explanation: '比喻生活、事业等不断向上发展，越来越好。'
  },
  {
    id: 5,
    riddle: '丈二和尚',
    answer: '摸不着头脑',
    explanation: '比喻弄不清情况，搞不明白是怎么回事。'
  },
  {
    id: 6,
    riddle: '八仙过海',
    answer: '各显神通',
    explanation: '比喻各自拿出本领，充分发挥自己的才能。'
  },
  {
    id: 7,
    riddle: '泥菩萨过江',
    answer: '自身难保',
    explanation: '比喻连自己都保护不了，更谈不上帮助别人。'
  },
  {
    id: 8,
    riddle: '猪八戒照镜子',
    answer: '里外不是人',
    explanation: '比喻两面不讨好，怎么做都不对。'
  },
  {
    id: 9,
    riddle: '姜太公钓鱼',
    answer: '愿者上钩',
    explanation: '比喻心甘情愿地上当或去做某事。'
  },
  {
    id: 10,
    riddle: '骑驴看唱本',
    answer: '走着瞧',
    explanation: '比喻等着看结果，见分晓。'
  }
]

// 模糊搜索函数
function fuzzySearch(data, keyword) {
  if (!keyword || !keyword.trim()) return data
  
  const lowerKeyword = keyword.toLowerCase()
  return data.filter(item => {
    const riddleMatch = item.riddle.toLowerCase().includes(lowerKeyword)
    const answerMatch = item.answer.toLowerCase().includes(lowerKeyword)
    const explanationMatch = item.explanation && item.explanation.toLowerCase().includes(lowerKeyword)
    return riddleMatch || answerMatch || explanationMatch
  })
}

export default function Xiehouyu ({ enterAction }) {
  const [allData, setAllData] = useState(defaultData)
  const [filteredData, setFilteredData] = useState(defaultData)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const listRef = useRef(null)

  // 加载所有数据到内存
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('data.json')
        if (!response.ok) {
          throw new Error('Failed to load data.json')
        }
        const jsonData = await response.json()
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          setAllData(jsonData)
          setFilteredData(jsonData)
        }
      } catch (err) {
        console.error('加载数据失败，使用默认数据:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // 处理搜索输入
  useEffect(() => {
    if (enterAction && enterAction.payload) {
      const payload = typeof enterAction.payload === 'string'
        ? enterAction.payload
        : (enterAction.payload[0] || '')
      setSearchText(payload)
      performSearch(payload)
    }
  }, [enterAction])

  // 执行模糊搜索
  const performSearch = useCallback((keyword) => {
    const results = fuzzySearch(allData, keyword)
    setFilteredData(results)
    setCurrentPage(1)
    setSelectedIndex(0)
  }, [allData])

  // 搜索输入处理
  const handleSearch = (e) => {
    const text = e.target.value
    setSearchText(text)
    performSearch(text)
  }

  // 分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  // 总页数
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / pageSize)
  }, [filteredData.length, pageSize])

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => {
          const newIndex = Math.min(paginatedData.length - 1, prev + 1)
          scrollToItem(newIndex)
          return newIndex
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => {
          const newIndex = Math.max(0, prev - 1)
          scrollToItem(newIndex)
          return newIndex
        })
      } else if (e.key === 'PageDown') {
        e.preventDefault()
        if (currentPage < totalPages) {
          setCurrentPage(prev => prev + 1)
          setSelectedIndex(0)
        }
      } else if (e.key === 'PageUp') {
        e.preventDefault()
        if (currentPage > 1) {
          setCurrentPage(prev => prev - 1)
          setSelectedIndex(0)
        }
      } else if (e.key === 'Enter') {
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [paginatedData.length, currentPage, totalPages])

  const scrollToItem = (index) => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('.list-item')
      if (items[index]) {
        items[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }

  const handleItemClick = (index) => {
    setSelectedIndex(index)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    setSelectedIndex(0)
  }

  const handlePageSizeChange = (size) => {
    setPageSize(size)
    setCurrentPage(1)
    setSelectedIndex(0)
    setShowSettings(false)
  }

  // 获取当前选中的完整数据
  const currentItem = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData[startIndex + selectedIndex] || {}
  }, [filteredData, currentPage, pageSize, selectedIndex])

  if (loading) {
    return (
      <div className="utools-container">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  return (
    <div className="utools-container">
      <div className="list-panel">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索歇后语..."
            value={searchText}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="list-info">
          共 {filteredData.length} 条，第 {currentPage}/{totalPages} 页
        </div>

        <div className="list-content" ref={listRef}>
          {paginatedData.length > 0 ? (
            paginatedData.map((item, index) => (
              <div
                key={item.id}
                className={`list-item ${index === selectedIndex ? 'active' : ''}`}
                onClick={() => handleItemClick(index)}
                title={item.riddle}
              >
                <div className="riddle">{item.riddle}</div>
              </div>
            ))
          ) : (
            <div className="no-result">暂无匹配结果</div>
          )}
        </div>

        <div className="pagination-bar">
          {totalPages > 1 && (
            <>
              <button 
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                ←
              </button>
              <div className="page-numbers">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 3) {
                    pageNum = i + 1
                  } else if (currentPage <= 2) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i
                  } else {
                    pageNum = currentPage - 1 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button 
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                →
              </button>
            </>
          )}
          
          <div className="page-size-select">
            <span className="page-size-label">每页</span>
            <select 
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="page-size-dropdown"
            >
              {[10, 20, 30, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="page-size-label">条</span>
          </div>
        </div>
      </div>

      <div className="detail-panel">
        {currentItem.riddle ? (
          <div className="content-card">
            <div className="header">歇后语</div>
            <h1 className="riddle-title">{currentItem.riddle}</h1>
            <div className="divider"></div>
            <div className="answer-section">
              <span className="label">【底】</span>
              <span className="answer-text">{currentItem.answer}</span>
            </div>
            <div className="explanation">
              <p>{currentItem.explanation}</p>
            </div>
            <div className="footer-stamp">妙语连珠</div>
          </div>
        ) : (
          <div className="empty-hint">请选择一条歇后语</div>
        )}
      </div>
    </div>
  )
}
