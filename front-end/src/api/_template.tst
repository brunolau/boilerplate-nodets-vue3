${
    using Typewriter.Extensions.Types;

    const string TEMPLATE_PATH = "src\\api";
    public static string PROJECT_ROOT = null;
    public static List<Type> pendingEnumTypes = new List<Type>();

    Template(Settings settings)
    {
        settings.OutputFilenameFactory = (file) => {
            if (PROJECT_ROOT == null)
            {
                GetProjectRoot(new System.IO.FileInfo(file.FullName).Directory.FullName);
            } 
            
            if (pendingEnumTypes.Count > 0) 
            {
                foreach (var enumType in pendingEnumTypes)
                {
                    WriteEnumTypeIntoFile(enumType);
                }

                pendingEnumTypes.Clear();
            }

            var publicOrPrivate = "public"; // file.Classes.Any(p => PathIsPrivate(p.FullName)) ? "private" : "public";
            var dirName = ToCamelCase((new System.IO.FileInfo(file.FullName)).Directory.Name);
            var fileWithoutExt = ToCamelCase(System.IO.Path.GetFileNameWithoutExtension(file.Name)).Replace("Controller","Client");
            var filePath = System.IO.Path.Combine(PROJECT_ROOT, TEMPLATE_PATH, publicOrPrivate, dirName, fileWithoutExt + ".ts");
            EnsureDirectory(filePath);
             
            return publicOrPrivate + "\\" + dirName + "\\" + fileWithoutExt + ".ts";             
        }; 
    }

    public static List<string> ignoredControllersList = new List<string>() 
    {
        "TicketingForTicketDateController",
        "SeatingTicketingDataController",
        "ParseExcelController",
        "ImportParseFileController",
        "UploadImageController"
    };

    string ToCamelCase(string typeName){
        return typeName.Substring(0,1).ToLowerInvariant() + typeName.Substring(1);
    }

    void GetProjectRoot(string currentLocation)
    {
        if (System.IO.Directory.GetFiles(currentLocation, "*.csproj").Length > 0)
        {
            PROJECT_ROOT = currentLocation;
            return;
        }

        GetProjectRoot(System.IO.Path.GetFullPath(System.IO.Path.Combine(currentLocation, "..\\")));
    }

    void EnsureDirectory(string filePath)
    {
        var dirPath = (new System.IO.FileInfo(filePath)).Directory.FullName;
        if (System.IO.Directory.Exists(dirPath))
        {
            return;
        }

        var currPath = dirPath;
        var prevPath = currPath;

        while (true)
        {
            if (!System.IO.Directory.Exists(currPath))
            {
                prevPath = currPath;
                currPath = System.IO.Path.GetFullPath(System.IO.Path.Combine(currPath, "..\\"));
            }
            else
            {
                break;
            }
        }

        System.IO.Directory.CreateDirectory(prevPath);
        EnsureDirectory(filePath);
    }
     
    bool ClassFilter(Class c) 
    {
        if (c.BaseClass == null || c.IsAbstract) {
            return false;
        }

        if (c.BaseClass == "ApiControllerBase" && !ignoredControllersList.Contains(c.Name)) {
            return true;
        }
          
        return ClassFilter(c.BaseClass);
    }

    bool ShouldRecursivelyIterateType(Type t) 
    {
        if (t.IsEnum) {
            return true;
        }

        return !t.IsPrimitive && !t.IsDate;
    }
     
    string ReturnType(Method m) 
    {
        var typeName = m.Type.Name;
        if (typeName == "IActionResult" || typeName == "ActionResult") {
            return "any";
        } else if (typeName.StartsWith("ActionResult<")) {
            return typeName.Substring(13, typeName.Length - 14);
        }

        return m.Type.Name == "IHttpActionResult" ? "void" : m.Type.Name;
    }

    string TypeClassName(Type t)
    {
        return t.Name.Replace("[]","").Replace("?","");
    }

    bool PathIsPrivate(string path)
    {
        return path.Contains(".Private.");
    }

    string AjaxProviderMethod(Method m)
    {
        var fullName = m.FullName;
        var isPublic = !PathIsPrivate(fullName);
        var splitArr = fullName.Split('.');
        var nameLower = m.Name.ToLowerInvariant();
        var apiPreffix = "appHttpProvider." + (isPublic ? "api" : "privateApi");

        if (nameLower == "get") {
            return apiPreffix + "Get";
        } else if (nameLower == "post") {
            return apiPreffix + "Post";
        } else if (nameLower == "delete") {
           return apiPreffix + "Delete";
        }

        if (m.Attributes != null) {
            foreach (var attr in m.Attributes)
            {
                if (attr == "HttpGet") {
                    return apiPreffix + "Get";
                }

                if (attr == "HttpPost") {
                    return apiPreffix + "Post";
                }

                if (attr == "HttpDelete") {
                    return apiPreffix + "Delete";
                }
            }
        }

        return "appHttpProvider." + (isPublic ? "api" : "privateApi")   + m.Name;
    }

    string ApiMethodName(Method m)
    {
        if (m.Parameters?.Count > 0)
        {
            return m.name;
        }
        else 
        {
            return "getWithoutParams";
        }
    }

    string ControllerName(Method m)
    {
        const string CONTROLLER_SUFFIX = "Controller";
        var splitArr = m.FullName.Split('.');
        var baseVal = splitArr[splitArr.Length-2];
        var retVal = baseVal.Substring(0, baseVal.Length - CONTROLLER_SUFFIX.Length);

        if (m.Attributes != null)
        {
            foreach (var attr in m.Attributes)
            {
                if (attr.Name == "Route")
                {
                    if (!attr.Value.StartsWith("api/v"))
                    {
                        retVal = retVal + "/" + attr.Value;
                    }
                    else
                    {
                        retVal = attr.Value;
                    }

                    break;
                }
            }
        }

        return retVal;

    }

    string DataParamName(Method m)
    {
        if (m.Type.Name == "number" || m.Type.Name.Contains("ActionResult<number>"))
        {
            return "id";
        }
        else
        {
            return "data";
        }
    }

    string RemoveTopLevelGenericArgument(string typeName)
    {
        var startIndex = typeName.IndexOf("<")+1;
        return typeName.Substring(startIndex, typeName.LastIndexOf(">") - startIndex);
    }

    IEnumerable<Class> AllControllers(File f)
    {
        return f.Classes.Where(ClassFilter).ToList();
    }

    IEnumerable<Class> AllClasses(File f)
    {
        var classes = f.Classes.Where(ClassFilter).ToList();
        return classes.Concat(classes.SelectMany(c => c.NestedClasses));
    }

    IEnumerable<Type> AllApplicableTypes(Class cls, bool isEnum)
    {
        var retVal = new Dictionary<string, Type>();
        foreach (var method in cls.Methods)
        {
            foreach (var parameter in method.Parameters)
            {
                AllApplicableTypesOfTypeRec(parameter.Type, retVal);
            }

            AllApplicableTypesOfTypeRec(method.Type, retVal); 
        } 
       
        var retList = retVal.Select(p => p.Value).Where(p => !p.Name.Contains("ActionResult") && !p.FullName.Contains("System.Collections.Generic") && TypeClassName(p) != "any");
        if (isEnum) {
            return retList.Where(p => p.IsEnum == true).Distinct();
        } else {
            return retList.Where(p => p.IsEnum == false);
        }
    }
     
    IEnumerable<Type> AllApplicableTypeClasses(Class cls)
    {
        return AllApplicableTypes(cls, false);
    }

    IEnumerable<Type> AllApplicableTypeEnums(Class cls)
    {
        return AllApplicableTypes(cls, true);
    }

    IEnumerable<Property> AllProperties(Type t)
    {
        return GetPropertyList(t, null, null);
    }

    IEnumerable<Property> GetPropertyList(Type t, Class c, Dictionary<string, Property> propMap)
    {
        if (propMap == null) {
            propMap = new Dictionary<string, Property>();
        }

        if (c != null ) {
            if (c.BaseClass != null) {
                GetPropertyList(null, c.BaseClass, propMap);
            }

            foreach (var classProp in c.Properties)
            {
                if (!propMap.ContainsKey(classProp.Name))
                {
                    var addProp = true;
                    if (classProp.Attributes != null)
                    {
                        foreach (var propAttr in classProp.Attributes)
                        {
                            if (propAttr.Name == "JsonIgnore")
                            {
                                addProp = false;
                                break;
                            }
                        }
                    }

                    if (addProp)
                    {
                        propMap[classProp.Name] = classProp;
                    }
                }
            }
        }

        if (t != null)
        {
            if (t.BaseClass != null) {
                GetPropertyList(null, t.BaseClass, propMap);
            }

            foreach (var typeProp in t.Properties)
            {
                if (!propMap.ContainsKey(typeProp.Name))
                {
                    var addProp = true;
                    if (typeProp.Attributes != null)
                    {
                        foreach (var propAttr in typeProp.Attributes)
                        {
                            if (propAttr.Name == "JsonIgnore")
                            {
                                addProp = false;
                                break;
                            }
                        }
                    }

                    if (addProp)
                    {
                        propMap[typeProp.Name] = typeProp;
                    }
                }
            }
        }

        return propMap.Select(p => p.Value);
    }

    string GetEnumFilePath(Type t)
    {
        var dirPath = System.IO.Path.Combine(PROJECT_ROOT, TEMPLATE_PATH, "public", "enums");
        var filePath = System.IO.Path.Combine(dirPath, t.name + ".ts");

        if (!System.IO.Directory.Exists(dirPath))
        {
            System.IO.Directory.CreateDirectory(dirPath);
        }

        return filePath;
    }

    void WriteEnumTypeIntoFile(Type t)
    {     
        if (PROJECT_ROOT == null) {
            pendingEnumTypes.Add(t);
            return;
        }

        try 
        {
            var i = 0;
            var filePath = GetEnumFilePath(t);
            var builder = new System.Text.StringBuilder();
            builder.AppendLine("export const enum " + t.Name + " {");

            foreach (var enumConst in t.Constants)
            {
                if (i > 0)
                {
                    builder.Append(",");
                    builder.AppendLine("");
                }

                builder.Append("    " + enumConst.Name + " = " + enumConst.Value);
                i += 1;
            }

            builder.AppendLine(""); 
            builder.AppendLine("}"); 
            var newContents = builder.ToString();

            try {
                if (System.IO.File.Exists(filePath))
                {
                    string fsContent;
                    using (var fsRead = new System.IO.FileStream(filePath, System.IO.FileMode.OpenOrCreate, System.IO.FileAccess.ReadWrite, System.IO.FileShare.ReadWrite))
                    {         
                        using (var reader = new System.IO.StreamReader(fsRead))
                        {
                            fsContent = reader.ReadToEnd();
                        }
                    }

                    if (fsContent == newContents)
                    {
                        return;
                    }

                    try {
                        System.IO.File.WriteAllText(filePath,string.Empty);
                    } catch(Exception) {}              
                }
            } catch(Exception) {}

            using (var fs = new System.IO.FileStream(filePath, System.IO.FileMode.OpenOrCreate, System.IO.FileAccess.ReadWrite, System.IO.FileShare.ReadWrite))
            {
                using (var writer = new System.IO.StreamWriter(fs))
                {
                    writer.Write(builder.ToString());
                    writer.Flush();
                    writer.Close();
                }
            }
        } 
        catch(Exception)
        { }
    }

    void AllApplicableTypesOfTypeRec(Type t,Dictionary<string, Type> typeList)
    {     
        if (t.IsEnumerable && t.TypeArguments != null && t.TypeArguments.Count > 0) {
            t = t.TypeArguments[0];
        }

        if (!ShouldRecursivelyIterateType(t)) {
            return;
        }

        if (t.Name == "void" || t.Name == "any" || t.Name == "JArray") {
            return;
        }

        if (typeList.ContainsKey(t.FullName)) {
            return;
        }

        //Check if nullable not already included
        if (t.IsNullable && typeList.ContainsKey(t.FullName.Substring(0, t.FullName.Length-1))) {
            return;
        }
        
        //Check if nullable not already present
        if (!t.IsNullable && typeList.ContainsKey(t.FullName + "?")) {
            return;
        }

        typeList[t.FullName] = t;
        foreach (var prop in GetPropertyList(t, null,null))
        {
            if (prop.Attributes?.Any(att => att.Name == "JsonIgnore") == false) {
                AllApplicableTypesOfTypeRec(prop.Type, typeList);
            }
        }
    }

    string InterfaceImplementationDeclaration(Type t)
    {
        if (t.Name == "LocalizedString") {
            return "implements ILocalizedString"; 
        }

        return "";
    }

    string ParameterDeclaration(Method m)
    {
        if (m.Parameters?.Count > 0)
        {
            return "data";
        }
        else
        {
            return "null";
        }
    }

    string ControllerClassName(Class c)
    {
        return c.Name.Replace("Controller", "Client");

    }

    string ClassPropertyTypeName(Property p) 
    {
        if (p.Type.Name == "Date") {
            return "DateWrapper";
        }

        return p.Type.Name;
    }

    string ClassPropertyDefaultValue(Property p) 
    {       
        if (p.Type.Name == "Date") {
            return "null";
        } else if (p.Type.IsEnum) {
            return p.Type.Name + "." + p.Type.Constants[0].Name;
        }

        return p.Type.Default();
    }
} 

$Classes(c => ClassFilter(c))[] 
//Auto-generated clientcode, do not modify, will get overwriten

$AllControllers[
$AllApplicableTypeEnums[
import {$Name} from './../enums/$name'    $WriteEnumTypeIntoFile]

$AllApplicableTypeClasses[
export class $TypeClassName $InterfaceImplementationDeclaration { $AllProperties[
    $Name: $ClassPropertyTypeName = $ClassPropertyDefaultValue;]
}
] 

export default class $ControllerClassName implements IWebApiClient { 
    webClient: true

    public static create(): $ControllerClassName {
        return new $ControllerClassName();
    } 
$Methods[  
    public $ApiMethodName<$Parameters[TArgs extends $Type, ]TResult extends $ReturnType>($Parameters[data: TArgs, ]timeout?: number) : Promise<TResult> {
        return $AjaxProviderMethod('$ControllerName', $ParameterDeclaration, timeout);
    };
    ]
}
]   