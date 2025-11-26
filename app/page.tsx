"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, RefreshCw, Settings, Check, Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import ConfigDialog from "@/components/config-dialog"
import JsonDownloadDialog from "@/components/json-download-dialog"
import { fakerEN_US as faker } from "@faker-js/faker"

// 类型定义
interface PersonData {
  fullName: string
  firstName: string
  lastName: string
  gender: string
  birthday: string
  title: string
  hairColor: string
  country: string
  street: string
  city: string
  state: string
  stateFullName: string
  zipCode: string
  phone: string
  email: string
  fullAddress: string
  occupation: string
  company: string
  companySize: string
  industry: string
  status: string
  salary: string
  ssn: string
  cardType: string
  cardNumber: string
  cvv: number
  expiry: string
  username: string
  password: string
  height: string
  weight: string
  bloodType: string
  os: string
  guid: string
  userAgent: string
  education: string
  website: string
  securityQuestion: string
  securityAnswer: string
}

interface SchoolData {
  name: string
  ncesid: string
  zip: string
  website: string
  address: string
  city: string
  state: string
  telephone: string
  st_grade: string
  end_grade: string
}

interface UniversityData {
  name: string
  ipedsid: string
  zip: string
  website: string
  address: string
  city: string
  state: string
  telephone: string
  type: string
}

const generateSeed = () => Math.floor(Math.random() * 1000000)

const DEFAULT_VISIBLE_FIELDS = [
  "fullName", "firstName", "lastName", "gender", "birthday", "title", "hairColor",
  "street", "city", "state", "zipCode", "phone", "email", "fullAddress",
  "ssn", "cardType", "cardNumber", "cvv", "expiry",
  "schoolName", "schoolId", "schoolZip", "schoolWebsite", "schoolAddress", "schoolPhone", "schoolGrades",
  "universityName", "universityId", "universityZip", "universityWebsite", "universityAddress", "universityPhone", "universityType"
]

const FIELD_LABELS: Record<string, string> = {
  fullName: "全名", firstName: "名", lastName: "姓", gender: "性别", birthday: "生日", title: "称谓", hairColor: "发色",
  country: "国家", street: "街道", city: "城市", state: "州", stateFullName: "州全名", zipCode: "邮编",
  phone: "电话", email: "邮箱", fullAddress: "完整地址", occupation: "职业", company: "公司",
  companySize: "公司规模", industry: "行业", status: "工作状态", salary: "薪资",
  ssn: "社会安全号", cardType: "信用卡类型", cardNumber: "信用卡号", cvv: "CVV", expiry: "到期日期",
  username: "用户名", password: "密码", height: "身高", weight: "体重", bloodType: "血型",
  os: "操作系统", guid: "GUID", userAgent: "用户代理", education: "教育程度",
  website: "个人网站", securityQuestion: "安全问题", securityAnswer: "安全答案",
  schoolName: "高中名称", schoolId: "高中ID", schoolZip: "高中邮编", schoolWebsite: "高中网站",
  schoolAddress: "高中地址", schoolCity: "高中城市", schoolState: "高中州", schoolPhone: "高中电话", schoolGrades: "年级范围",
  universityName: "大学名称", universityId: "大学ID", universityZip: "大学邮编", universityWebsite: "大学网站",
  universityAddress: "大学地址", universityCity: "大学城市", universityState: "大学州", universityPhone: "大学电话", universityType: "大学类型"
}

const FIELD_CATEGORIES = {
  basic: { title: "基本信息", fields: ["fullName", "firstName", "lastName", "gender", "birthday", "title", "hairColor"] },
  contact: { title: "联系信息", fields: ["street", "city", "state", "stateFullName", "zipCode", "phone", "email", "fullAddress"] },
  work: { title: "工作信息", fields: ["occupation", "company", "companySize", "industry", "status", "salary"] },
  physical: { title: "身体信息", fields: ["height", "weight", "bloodType"] },
  financial: { title: "金融信息", fields: ["ssn", "cardType", "cardNumber", "cvv", "expiry"] },
  account: { title: "账户信息", fields: ["username", "password", "securityQuestion", "securityAnswer"] },
  tech: { title: "技术信息", fields: ["os", "userAgent", "guid"] },
  other: { title: "其他信息", fields: ["education", "website", "country"] },
  school: { title: "高中信息", fields: ["schoolName", "schoolId", "schoolZip", "schoolWebsite", "schoolAddress", "schoolCity", "schoolState", "schoolPhone", "schoolGrades"] },
  university: { title: "大学信息", fields: ["universityName", "universityId", "universityZip", "universityWebsite", "universityAddress", "universityCity", "universityState", "universityPhone", "universityType"] },
}

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" }, { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }
]

// 主逻辑组件
function GeneratorContent() {
  const [data, setData] = useState<PersonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null)
  const [universityData, setUniversityData] = useState<UniversityData | null>(null)
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  // 参数解析
  const state = searchParams.get("state") || ""
  const city = searchParams.get("city") || ""
  const gender = searchParams.get("gender") || ""
  const minAge = Number.parseInt(searchParams.get("minAge") || "0") || 0
  const maxAge = Number.parseInt(searchParams.get("maxAge") || "0") || 0
  const visibleFields = searchParams.get("fields")?.split(",") || DEFAULT_VISIBLE_FIELDS
  const seed = Number.parseInt(searchParams.get("seed") || "0") || generateSeed()

  const highState = searchParams.get("highState") || ""
  const highCity = searchParams.get("highCity") || ""
  const universityState = searchParams.get("universityState") || ""
  const universityCity = searchParams.get("universityCity") || ""

  // 核心生成函数
  const fetchData = useCallback(async (seedOverride?: number) => {
    setLoading(true)
    try {
      const currentSeed = seedOverride ?? seed
      faker.seed(currentSeed)

      // 1. 生成个人数据 (Faker)
      let sexType: 'male' | 'female' | undefined = undefined
      if (gender === 'Male') sexType = 'male'
      else if (gender === 'Female') sexType = 'female'
      else sexType = faker.person.sexType()
      
      const firstName = faker.person.firstName(sexType)
      const lastName = faker.person.lastName()
      const fullName = `${firstName} ${lastName}`

      let birthDate: Date
      if (minAge > 0 && maxAge > 0) {
        const age = faker.number.int({ min: minAge, max: maxAge })
        birthDate = faker.date.birthdate({ mode: 'age', min: age, max: age })
      } else {
        birthDate = faker.date.birthdate({ min: 18, max: 70, mode: 'age' })
      }
      const birthday = birthDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })

      let targetState = state && state !== "random" ? state : faker.location.state({ abbreviated: true })
      const stateObj = US_STATES.find(s => s.code === targetState)
      const stateFullName = stateObj ? stateObj.name : targetState
      
      const targetCity = city && city !== "random" ? city : faker.location.city()
      const zipCode = faker.location.zipCodeByState(targetState)
      const street = faker.location.streetAddress()
      const fullAddress = `${street}, ${targetCity}, ${targetState} ${zipCode}`

      const result: PersonData = {
        fullName, firstName, lastName,
        gender: sexType.charAt(0).toUpperCase() + sexType.slice(1),
        birthday,
        title: faker.person.prefix(sexType),
        hairColor: faker.helpers.arrayElement(['Black', 'Brown', 'Blond', 'Auburn', 'Red', 'Gray', 'White']),
        country: "United States",
        street, city: targetCity, state: targetState, stateFullName, zipCode,
        phone: faker.phone.number({ style: 'national' }),
        email: faker.internet.email({ firstName, lastName }),
        fullAddress,
        occupation: faker.person.jobTitle(),
        company: faker.company.name(),
        companySize: faker.number.int({ min: 10, max: 50000 }).toString(),
        industry: faker.commerce.department(),
        status: faker.helpers.arrayElement(['Full-time', 'Part-time', 'Freelance']),
        salary: `$${faker.number.int({ min: 30000, max: 200000 }).toLocaleString()}`,
        ssn: faker.finance.accountNumber(9).replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3'),
        cardType: faker.finance.creditCardIssuer(),
        cardNumber: faker.finance.creditCardNumber(),
        cvv: parseInt(faker.finance.creditCardCVV()),
        expiry: faker.date.future().toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }),
        username: faker.internet.username({ firstName, lastName }),
        password: faker.internet.password(),
        height: `${faker.number.int({ min: 150, max: 200 })} cm`,
        weight: `${faker.number.int({ min: 45, max: 120 })} kg`,
        bloodType: faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
        os: faker.helpers.arrayElement(['Windows 11', 'Windows 10', 'macOS', 'Linux', 'iOS', 'Android']),
        guid: faker.string.uuid(),
        userAgent: faker.internet.userAgent(),
        education: faker.helpers.arrayElement(["High School", "Associate Degree", "Bachelor's Degree", "Master's Degree", "PhD"]),
        website: faker.internet.url(),
        securityQuestion: "What is your mother's maiden name?",
        securityAnswer: faker.person.lastName()
      }

      // 立即更新核心数据，让用户感觉"有反应"
      setData(result)

      // 2. 异步获取教育数据 (不阻塞核心展示)
      // 高中
      let schoolResult: SchoolData | null = null
      const schoolStateToUse = highState || targetState
      if (schoolStateToUse) {
        try {
          const schoolParams = new URLSearchParams()
          schoolParams.append("select", "name,ncesid,zip,website,address,city,state,telephone,st_grade,end_grade")
          schoolParams.append("where", `state="${schoolStateToUse}" AND end_grade = "12"`)
          schoolParams.append("order_by", `random(${currentSeed})`)
          schoolParams.append("limit", "1")
          
          const res = await fetch(`https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/us-public-schools/records?${schoolParams.toString()}`)
          if (res.ok) {
            const apiData = await res.json()
            if (apiData.results?.[0]) {
              const s = apiData.results[0]
              schoolResult = {
                name: s.name || "", ncesid: s.ncesid || "", zip: s.zip || "", website: s.website || "",
                address: s.address || "", city: s.city || "", state: s.state || "", telephone: s.telephone || "",
                st_grade: s.st_grade || "", end_grade: s.end_grade || ""
              }
            }
          }
        } catch (e) { console.warn(e) }
      }
      setSchoolData(schoolResult)

      // 大学
      let universityResult: UniversityData | null = null
      const universityStateToUse = universityState || targetState
      if (universityStateToUse) {
        try {
          const uniParams = new URLSearchParams()
          uniParams.append("select", "name,ipedsid,zip,website,address,city,state,telephone,type")
          uniParams.append("where", `state="${universityStateToUse}" AND type="1"`)
          uniParams.append("order_by", `random(${currentSeed})`)
          uniParams.append("limit", "1")

          const res = await fetch(`https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/us-colleges-and-universities/records?${uniParams.toString()}`)
          if (res.ok) {
            const apiData = await res.json()
            if (apiData.results?.[0]) {
              const u = apiData.results[0]
              universityResult = {
                name: u.name || "", ipedsid: u.ipedsid || "", zip: u.zip || "", website: u.website || "",
                address: u.address || "", city: u.city || "", state: u.state || "", telephone: u.telephone || "",
                type: u.type || ""
              }
            }
          }
        } catch (e) { console.warn(e) }
      }
      setUniversityData(universityResult)

    } catch (error) {
      console.error(error)
      toast({ title: "生成错误", description: "请重试", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [state, city, gender, minAge, maxAge, seed, highState, highCity, universityState, universityCity])

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    router.replace(`/?${params.toString()}`)
  }

  // 点击按钮：同时更新URL和强制刷新数据
  const handleRegenerate = () => {
    const newSeed = generateSeed()
    // 1. 立即开始加载（提升响应速度感）
    setLoading(true)
    // 2. 更新 URL（用于分享）
    updateUrlParams({ seed: newSeed.toString() })
    // 3. 强制调用生成函数（传入新种子，不依赖 URL 回传，防止卡顿）
    fetchData(newSeed)
  }

  // 初始化加载
  useEffect(() => {
    if (!searchParams.get("seed")) {
      handleRegenerate()
    } else {
      // 如果有种子，说明是首次加载或通过链接进入，执行一次
      // 注意：为了避免 handleRegenerate 导致的双重调用，这里加个判断
      // 但由于 fetchData 使用 useCallback 且依赖项变化，React 可能会自动处理
      // 为了稳妥，我们仅在 data 为空时调用
      if (!data) fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
      toast({ title: "复制成功", description: `已复制 ${FIELD_LABELS[field]}` })
    } catch (error) {
      toast({ title: "复制失败", variant: "destructive" })
    }
  }

  const renderDataItem = (key: string, value: any) => {
    if (!visibleFields.includes(key)) return null
    let displayValue = value?.toString() || ""
    let isLink = false

    if (key.startsWith("school") && schoolData) {
      if (key === "schoolName") displayValue = schoolData.name
      else if (key === "schoolId") displayValue = schoolData.ncesid
      else if (key === "schoolZip") displayValue = schoolData.zip
      else if (key === "schoolWebsite") { displayValue = schoolData.website; isLink = true }
      else if (key === "schoolAddress") displayValue = `${schoolData.address}, ${schoolData.city}`
      else if (key === "schoolPhone") displayValue = schoolData.telephone
      else if (key === "schoolGrades") displayValue = `${schoolData.st_grade}-${schoolData.end_grade}`
    } else if (key.startsWith("university") && universityData) {
      if (key === "universityName") displayValue = universityData.name
      else if (key === "universityId") displayValue = universityData.ipedsid
      else if (key === "universityZip") displayValue = universityData.zip
      else if (key === "universityWebsite") { displayValue = universityData.website; isLink = true }
      else if (key === "universityAddress") displayValue = `${universityData.address}, ${universityData.city}`
      else if (key === "universityPhone") displayValue = universityData.telephone
      else if (key === "universityType") displayValue = universityData.type
    }

    if (!displayValue || displayValue === "NOT AVAILABLE") return null

    return (
      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex-1 overflow-hidden">
          <div className="text-sm text-gray-600 mb-1">{FIELD_LABELS[key]}</div>
          <div className="font-medium text-gray-900 truncate">
            {isLink ? (
              <a href={displayValue.startsWith("http") ? displayValue : `https://${displayValue}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                {displayValue}
              </a>
            ) : displayValue}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(displayValue, key)}>
          {copiedField === key ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    )
  }

  const renderCategory = (categoryKey: string, category: any) => {
    const hasData = category.fields.some((f: string) => visibleFields.includes(f) && (
      (f.startsWith("school") && schoolData) || 
      (f.startsWith("university") && universityData) || 
      (data && (data as any)[f])
    ))
    if (!hasData) return null

    return (
      <Card key={categoryKey} className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800">{category.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {category.fields.map((field: string) => renderDataItem(field, (data as any)?.[field]))}
        </CardContent>
      </Card>
    )
  }

  const getStateDisplayName = (code: string) => {
    const s = US_STATES.find(x => x.code ===Pc code)
    return s ? `${s.name} (${s.code})` : code
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">美国地址生成器</h1>
          <p className="text-lg text-gray-600 mb-6">生成真实的美国地址和个人信息数据</p>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Badge variant="outline">随机种子: {seed}</Badge>
            {state && <Badge variant="secondary">州: {getStateDisplayName(state)}</Badge>}
            {city && <Badge variant="secondary">城市: {city}</Badge>}
            {gender && <Badge variant="secondary">性别: {gender === 'Male' ? '男' : '女'}</Badge>}
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={handleRegenerate} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 生成中...</> : <><RefreshCw className="mr-2 h-4 w-4" /> 重新生成</>}
            </Button>
            <Button variant="outline" onClick={() => setJsonDialogOpen(true)} disabled={!data}>
              <Download className="mr-2 h-4 w-4" /> 导出JSON
            </Button>
            <Button variant="outline" onClick={() => setConfigOpen(true)}>
              <Settings className="mr-2 h-4 w-4" /> 配置参数
            </Button>
          </div>
        </div>

        {data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(FIELD_CATEGORIES).map(([key, category]) => renderCategory(key, category))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">正在初始化数据...</div>
        )}
      </div>

      <ConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        currentConfig={{ state, city, gender, minAge, maxAge, visibleFields, seed, birthYear: 0, highState, highCity, universityState, universityCity }}
      />
      <JsonDownloadDialog
        open={jsonDialogOpen}
        onOpenChange={setJsonDialogOpen}
        data={data}
        schoolData={schoolData}
        universityData={universityData}
        visibleFields={visibleFields}
      />
    </div>
  )
}

// 根组件：必须包裹 Suspense 以支持 useSearchParams
export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <GeneratorContent />
    </Suspense>
  )
}
