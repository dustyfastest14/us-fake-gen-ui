"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, RefreshCw, Settings, Check, Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import ConfigDialog from "@/components/config-dialog"
import JsonDownloadDialog from "@/components/json-download-dialog"
// 引入 Faker
import { fakerEN_US as faker } from "@faker-js/faker"

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

// 生成随机数种子
const generateSeed = () => Math.floor(Math.random() * 1000000)

const DEFAULT_VISIBLE_FIELDS = [
  "fullName",
  "firstName",
  "lastName",
  "gender",
  "birthday",
  "title",
  "hairColor",
  "street",
  "city",
  "state",
  "zipCode",
  "phone",
  "email",
  "fullAddress",
  "ssn",
  "cardType",
  "cardNumber",
  "cvv",
  "expiry",
  "schoolName",
  "schoolId",
  "schoolZip",
  "schoolWebsite",
  "schoolAddress",
  "schoolPhone",
  "schoolGrades",
  "universityName",
  "universityId",
  "universityZip",
  "universityWebsite",
  "universityAddress",
  "universityPhone",
  "universityType",
]

const FIELD_CATEGORIES = {
  basic: {
    title: "基本信息",
    fields: ["fullName", "firstName", "lastName", "gender", "birthday", "title", "hairColor"],
  },
  contact: {
    title: "联系信息",
    fields: ["street", "city", "state", "stateFullName", "zipCode", "phone", "email", "fullAddress"],
  },
  work: {
    title: "工作信息",
    fields: ["occupation", "company", "companySize", "industry", "status", "salary"],
  },
  physical: {
    title: "身体信息",
    fields: ["height", "weight", "bloodType"],
  },
  financial: {
    title: "金融信息",
    fields: ["ssn", "cardType", "cardNumber", "cvv", "expiry"],
  },
  account: {
    title: "账户信息",
    fields: ["username", "password", "securityQuestion", "securityAnswer"],
  },
  tech: {
    title: "技术信息",
    fields: ["os", "userAgent", "guid"],
  },
  other: {
    title: "其他信息",
    fields: ["education", "website", "country"],
  },
  school: {
    title: "高中信息",
    fields: [
      "schoolName",
      "schoolId",
      "schoolZip",
      "schoolWebsite",
      "schoolAddress",
      "schoolCity",
      "schoolState",
      "schoolPhone",
      "schoolGrades",
    ],
  },
  university: {
    title: "大学信息",
    fields: [
      "universityName",
      "universityId",
      "universityZip",
      "universityWebsite",
      "universityAddress",
      "universityCity",
      "universityState",
      "universityPhone",
      "universityType",
    ],
  },
}

const FIELD_LABELS: Record<string, string> = {
  fullName: "全名",
  firstName: "名",
  lastName: "姓",
  gender: "性别",
  birthday: "生日",
  title: "称谓",
  hairColor: "发色",
  country: "国家",
  street: "街道",
  city: "城市",
  state: "州",
  stateFullName: "州全名",
  zipCode: "邮编",
  phone: "电话",
  email: "邮箱",
  fullAddress: "完整地址",
  occupation: "职业",
  company: "公司",
  companySize: "公司规模",
  industry: "行业",
  status: "工作状态",
  salary: "薪资",
  ssn: "社会安全号",
  cardType: "信用卡类型",
  cardNumber: "信用卡号",
  cvv: "CVV",
  expiry: "到期日期",
  username: "用户名",
  password: "密码",
  height: "身高",
  weight: "体重",
  bloodType: "血型",
  os: "操作系统",
  guid: "GUID",
  userAgent: "用户代理",
  education: "教育程度",
  website: "个人网站",
  securityQuestion: "安全问题",
  securityAnswer: "安全答案",
  schoolName: "高中名称",
  schoolId: "高中ID",
  schoolZip: "高中邮编",
  schoolWebsite: "高中网站",
  schoolAddress: "高中地址",
  schoolCity: "高中城市",
  schoolState: "高中州",
  schoolPhone: "高中电话",
  schoolGrades: "年级范围",
  universityName: "大学名称",
  universityId: "大学ID",
  universityZip: "大学邮编",
  universityWebsite: "大学网站",
  universityAddress: "大学地址",
  universityCity: "大学城市",
  universityState: "大学州",
  universityPhone: "大学电话",
  universityType: "大学类型",
}

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
]

export default function HomePage() {
  const [data, setData] = useState<PersonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null)
  const [universityData, setUniversityData] = useState<UniversityData | null>(null)
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  // 从URL参数获取配置
  const state = searchParams.get("state") || ""
  const city = searchParams.get("city") || ""
  const gender = searchParams.get("gender") || ""
  const minAge = Number.parseInt(searchParams.get("minAge") || "0") || 0
  const maxAge = Number.parseInt(searchParams.get("maxAge") || "0") || 0
  const visibleFields = searchParams.get("fields")?.split(",") || DEFAULT_VISIBLE_FIELDS
  const seed = Number.parseInt(searchParams.get("seed") || "0") || generateSeed()

  // 高中和大学筛选参数
  const highState = searchParams.get("highState") || ""
  const highCity = searchParams.get("highCity") || ""
  const universityState = searchParams.get("universityState") || ""
  const universityCity = searchParams.get("universityCity") || ""

  // 如果没有fields参数，重定向到默认配置
  useEffect(() => {
    if (!searchParams.get("fields")) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("fields", DEFAULT_VISIBLE_FIELDS.join(","))
      // 如果没有seed参数，生成一个新的随机种子
      if (!searchParams.get("seed")) {
        params.set("seed", generateSeed().toString())
      }
      router.replace(`/?${params.toString()}`)
    }
  }, [searchParams, router])

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    router.replace(`/?${params.toString()}`)
  }

  const fetchData = async (newSeed?: number) => {
    setLoading(true)
    try {
      const currentSeed = newSeed || seed
      
      // 初始化 Faker 种子，确保数据可重现
      faker.seed(currentSeed)

      // 1. 生成个人基础数据 (替代原 API)
      
      // 处理性别
      let sexType: 'male' | 'female' | undefined = undefined
      if (gender === 'Male') sexType = 'male'
      else if (gender === 'Female') sexType = 'female'
      else sexType = faker.person.sexType()
      
      const firstName = faker.person.firstName(sexType)
      const lastName = faker.person.lastName()
      const fullName = `${firstName} ${lastName}`

      // 处理生日/年龄
      let birthDate: Date
      if (minAge > 0 && maxAge > 0) {
        const age = faker.number.int({ min: minAge, max: maxAge })
        const currentYear = new Date().getFullYear()
        // 使用 birthdate 生成符合年龄的日期
        birthDate = faker.date.birthdate({ mode: 'age', min: age, max: age })
      } else {
        // 默认 18-70 岁
        birthDate = faker.date.birthdate({ min: 18, max: 70, mode: 'age' })
      }
      const birthday = birthDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })

      // 处理地址
      // 如果用户指定了 state/city，尽量使用（Faker 的 location 不一定能精确匹配所有城市，这里做简化处理）
      let targetState = state && state !== "random" ? state : faker.location.state({ abbreviated: true })
      // 查找州全名
      const stateObj = US_STATES.find(s => s.code === targetState)
      const stateFullName = stateObj ? stateObj.name : targetState
      
      const targetCity = city && city !== "random" ? city : faker.location.city()
      const zipCode = faker.location.zipCodeByState(targetState)
      const street = faker.location.streetAddress()
      const fullAddress = `${street}, ${targetCity}, ${targetState} ${zipCode}`

      // 构建 Result 对象
      const result: PersonData = {
        fullName,
        firstName,
        lastName,
        gender: sexType.charAt(0).toUpperCase() + sexType.slice(1),
        birthday,
        title: faker.person.prefix(sexType),
        hairColor: faker.helpers.arrayElement(['Black', 'Brown', 'Blond', 'Auburn', 'Red', 'Gray', 'White']),
        country: "United States",
        street,
        city: targetCity,
        state: targetState,
        stateFullName,
        zipCode,
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

      // 2. 获取高中信息 (保留原有逻辑，OpenDataSoft API 通常比较稳定)
      let schoolResult: SchoolData | null = null
      const schoolStateToUse = highState || result.state
      const schoolCityToUse = highCity || result.city

      if (schoolStateToUse && schoolStateToUse !== 'random') {
        try {
          const schoolParams = new URLSearchParams()
          schoolParams.append("select", "name,ncesid,zip,website,address,city,state,telephone,st_grade,end_grade")

          let whereClause = `state="${schoolStateToUse}" AND end_grade = "12"`
          if (schoolCityToUse && schoolCityToUse !== "random") {
            whereClause += ` AND city="${schoolCityToUse.toUpperCase()}"`
          }

          schoolParams.append("where", whereClause)
          schoolParams.append("order_by", `random(${currentSeed})`)
          schoolParams.append("limit", "1")

          const schoolResponse = await fetch(
            `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/us-public-schools/records?${schoolParams.toString()}`,
          )
          const schoolApiData = await schoolResponse.json()

          // 降级策略：如果指定城市没找到，则只按州查找
          if ((!schoolApiData.results || schoolApiData.results.length === 0) && schoolCityToUse && schoolCityToUse !== "random") {
            const fallbackParams = new URLSearchParams()
            fallbackParams.append("select", "name,ncesid,zip,website,address,city,state,telephone,st_grade,end_grade")
            fallbackParams.append("where", `state="${schoolStateToUse}" AND end_grade = "12"`)
            fallbackParams.append("order_by", `random(${currentSeed})`)
            fallbackParams.append("limit", "1")

            const fallbackResponse = await fetch(
              `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/us-public-schools/records?${fallbackParams.toString()}`,
            )
            const fallbackData = await fallbackResponse.json()

            if (fallbackData.results && fallbackData.results.length > 0) {
              const school = fallbackData.results[0]
              schoolResult = {
                name: school.name || "",
                ncesid: school.ncesid || "",
                zip: school.zip || "",
                website: school.website || "",
                address: school.address || "",
                city: school.city || "",
                state: school.state || "",
                telephone: school.telephone || "",
                st_grade: school.st_grade || "",
                end_grade: school.end_grade || "",
              }
            }
          } else if (schoolApiData.results && schoolApiData.results.length > 0) {
            const school = schoolApiData.results[0]
            schoolResult = {
              name: school.name || "",
              ncesid: school.ncesid || "",
              zip: school.zip || "",
              website: school.website || "",
              address: school.address || "",
              city: school.city || "",
              state: school.state || "",
              telephone: school.telephone || "",
              st_grade: school.st_grade || "",
              end_grade: school.end_grade || "",
            }
          }
        } catch (error) {
          console.error("Failed to fetch school data:", error)
        }
      }

      // 3. 获取大学信息
      let universityResult: UniversityData | null = null
      const universityStateToUse = universityState || result.state

      if (universityStateToUse && universityStateToUse !== 'random') {
        try {
          const universityParams = new URLSearchParams()
          universityParams.append("select", "name,ipedsid,zip,website,address,city,state,telephone,type")

          let whereClause = `state="${universityStateToUse}" AND type="1"`
          if (universityCity && universityCity !== "random") {
            whereClause += ` AND city="${universityCity.toUpperCase()}"`
          }

          universityParams.append("where", whereClause)
          universityParams.append("order_by", `random(${currentSeed})`)
          universityParams.append("limit", "1")

          const universityResponse = await fetch(
            `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/us-colleges-and-universities/records?${universityParams.toString()}`,
          )
          const universityApiData = await universityResponse.json()

          if (universityApiData.results && universityApiData.results.length > 0) {
            const university = universityApiData.results[0]
            universityResult = {
              name: university.name || "",
              ipedsid: university.ipedsid || "",
              zip: university.zip || "",
              website: university.website || "",
              address: university.address || "",
              city: university.city || "",
              state: university.state || "",
              telephone: university.telephone || "",
              type: university.type || "",
            }
          }
        } catch (error) {
          console.error("Failed to fetch university data:", error)
        }
      }

      setSchoolData(schoolResult)
      setUniversityData(universityResult)

      // 更新URL参数
      if (newSeed) {
        updateUrlParams({
          seed: currentSeed.toString(),
        })
      }

      setData(result)
    } catch (error) {
      console.error(error)
      toast({
        title: "请求失败",
        description: "生成数据时发生错误，请重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
      toast({
        title: "复制成功",
        description: `已复制 ${FIELD_LABELS[field]}`,
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    // 只有当URL参数完整时才生成数据
    if (searchParams.get("fields") && searchParams.get("seed")) {
      fetchData()
    }
  }, [state, city, gender, minAge, maxAge, seed, highState, highCity, universityState, universityCity])

  const renderDataItem = (key: string, value: any) => {
    if (!visibleFields.includes(key)) return null

    // 处理学校数据字段
    if (key.startsWith("school") && schoolData) {
      let schoolValue = ""
      switch (key) {
        case "schoolName":
          schoolValue = schoolData.name
          break
        case "schoolId":
          schoolValue = schoolData.ncesid
          break
        case "schoolZip":
          schoolValue = schoolData.zip
          break
        case "schoolWebsite":
          schoolValue = schoolData.website && schoolData.website !== "NOT AVAILABLE" ? schoolData.website : ""
          break
        case "schoolAddress":
          schoolValue = `${schoolData.address}, ${schoolData.city}, ${schoolData.state} ${schoolData.zip}`
          break
        case "schoolCity":
          schoolValue = schoolData.city
          break
        case "schoolState":
          schoolValue = schoolData.state
          break
        case "schoolPhone":
          schoolValue = schoolData.telephone
          break
        case "schoolGrades":
          schoolValue = `${schoolData.st_grade}-${schoolData.end_grade}年级`
          break
      }

      if (!schoolValue) return null

      return (
        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">{FIELD_LABELS[key]}</div>
            <div className="font-medium text-gray-900">
              {key === "schoolWebsite" && schoolValue ? (
                <a
                  href={schoolValue.startsWith("http") ? schoolValue : `https://${schoolValue}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {schoolValue}
                </a>
              ) : (
                schoolValue
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(schoolValue, key)}
            className="ml-2 h-8 w-8 p-0"
          >
            {copiedField === key ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      )
    }

    // 处理大学数据字段
    if (key.startsWith("university") && universityData) {
      let universityValue = ""
      switch (key) {
        case "universityName":
          universityValue = universityData.name
          break
        case "universityId":
          universityValue = universityData.ipedsid
          break
        case "universityZip":
          universityValue = universityData.zip
          break
        case "universityWebsite":
          universityValue =
            universityData.website && universityData.website !== "NOT AVAILABLE" ? universityData.website : ""
          break
        case "universityAddress":
          universityValue = `${universityData.address}, ${universityData.city}, ${universityData.state} ${universityData.zip}`
          break
        case "universityCity":
          universityValue = universityData.city
          break
        case "universityState":
          universityValue = universityData.state
          break
        case "universityPhone":
          universityValue = universityData.telephone
          break
        case "universityType":
          const typeMap: Record<string, string> = {
            "1": "公立大学",
            "2": "私立非营利大学",
            "3": "私立营利大学",
          }
          universityValue = typeMap[universityData.type] || universityData.type
          break
      }

      if (!universityValue) return null

      return (
        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">{FIELD_LABELS[key]}</div>
            <div className="font-medium text-gray-900">
              {key === "universityWebsite" && universityValue ? (
                <a
                  href={universityValue.startsWith("http") ? universityValue : `https://${universityValue}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {universityValue}
                </a>
              ) : (
                universityValue
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(universityValue, key)}
            className="ml-2 h-8 w-8 p-0"
          >
            {copiedField === key ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      )
    }

    return (
      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-1">{FIELD_LABELS[key]}</div>
          <div className="font-medium text-gray-900">{value?.toString()}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(value?.toString() || "", key)}
          className="ml-2 h-8 w-8 p-0"
        >
          {copiedField === key ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    )
  }

  const renderCategory = (categoryKey: string, category: any) => {
    const categoryFields = category.fields.filter((field: string) => {
      if (!visibleFields.includes(field)) return false

      // 处理学校字段
      if (field.startsWith("school")) {
        return schoolData !== null
      }

      // 处理大学字段
      if (field.startsWith("university")) {
        return universityData !== null
      }

      // 处理普通字段
      return data && data[field as keyof PersonData]
    })

    if (categoryFields.length === 0) return null

    return (
      <Card key={categoryKey} className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800">{category.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryFields.map((field: string) => renderDataItem(field, data?.[field as keyof PersonData]))}
        </CardContent>
      </Card>
    )
  }

  const handleRegenerate = () => {
    const newSeed = generateSeed()
    fetchData(newSeed)
  }

  const currentYear = new Date().getFullYear()

  const getStateDisplayName = (stateCode: string) => {
    const stateInfo = US_STATES.find((s) => s.code === stateCode)
    return stateInfo ? `${stateInfo.name} (${stateInfo.code})` : stateCode
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">美国地址生成器</h1>
          <p className="text-lg text-gray-600 mb-6">生成真实的美国地址和个人信息数据</p>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Badge variant="outline" className="text-sm">
              随机种子: {seed}
            </Badge>
            {state && (
              <Badge variant="secondary" className="text-sm">
                州: {getStateDisplayName(state)}
              </Badge>
            )}
            {city && (
              <Badge variant="secondary" className="text-sm">
                城市: {city}
              </Badge>
            )}
            {gender && (
              <Badge variant="secondary" className="text-sm">
                性别: {gender === "Male" ? "男" : "女"}
              </Badge>
            )}
            {minAge > 0 && maxAge > 0 && (
              <Badge variant="secondary" className="text-sm">
                年龄: {minAge}-{maxAge}岁 ({currentYear - maxAge}-{currentYear - minAge}年出生)
              </Badge>
            )}
            {highState && (
              <Badge variant="secondary" className="text-sm">
                高中州: {getStateDisplayName(highState)}
              </Badge>
            )}
            {highCity && (
              <Badge variant="secondary" className="text-sm">
                高中城市: {highCity}
              </Badge>
            )}
            {universityState && (
              <Badge variant="secondary" className="text-sm">
                大学州: {getStateDisplayName(universityState)}
              </Badge>
            )}
            {universityCity && (
              <Badge variant="secondary" className="text-sm">
                大学城市: {universityCity}
              </Badge>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={handleRegenerate} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重新生成
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setJsonDialogOpen(true)} disabled={!data}>
              <Download className="mr-2 h-4 w-4" />
              导出JSON
            </Button>

            <Button variant="outline" onClick={() => setConfigOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              配置参数
            </Button>
          </div>
        </div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(FIELD_CATEGORIES).map(([key, category]) => renderCategory(key, category))}
          </div>
        )}

        {!data && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">点击"重新生成"按钮开始生成数据</p>
          </div>
        )}
      </div>

      <ConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        currentConfig={{
          state,
          city,
          gender,
          minAge,
          maxAge,
          visibleFields,
          seed,
          birthYear: 0,
          highState,
          highCity,
          universityState,
          universityCity,
        }}
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
