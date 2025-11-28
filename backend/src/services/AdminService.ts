// @ts-nocheck
const DynamoDBService = require('./DynamoDBService');
const { v4: uuidv4 } = require('uuid');

class AdminService {
  constructor() {
    this.dynamoService = new DynamoDBService(process.env.DYNAMODB_TABLE_NAME || 'Assesment_placipy');
  }

  // Delegate DynamoDB methods to the service
  async scanTable(params) {
    return this.dynamoService.scanTable(params);
  }

  async queryTable(params) {
    return this.dynamoService.queryTable(params);
  }

  async putItem(item) {
    return this.dynamoService.putItem(item);
  }

  async getItem(params) {
    return this.dynamoService.getItem(params);
  }

  async updateItem(params) {
    return this.dynamoService.updateItem(params);
  }

  async deleteItem(params) {
    return this.dynamoService.deleteItem(params);
  }

  async batchWrite(items) {
    return this.dynamoService.batchWrite(items);
  }

  // Dashboard Statistics
  async getDashboardStats() {
    try {
      const [colleges, officers, students, assessments] = await Promise.all([
        this.getAllColleges(),
        this.getAllOfficers({}),
        this.getAllStudents(),
        this.getAllAssessments({})
      ]);

      const activeAssessments = assessments.filter(assessment => assessment.status === 'active');
      
      return {
        totalColleges: colleges.length,
        totalOfficers: officers.length,
        totalStudents: students.length,
        activeAssessments: activeAssessments.length,
        totalAssessments: assessments.length,
        recentActivity: await this.getRecentActivity(),
        topColleges: await this.getTopColleges()
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getTopColleges() {
    try {
      const colleges = await this.getAllColleges();
      const collegeStats = [];

      for (const college of colleges) {
        // Get student count for this college
        const students = await this.getStudentsByCollege(college.id);
        // Get officer count for this college
        const officers = await this.getOfficersByCollege(college.id);
        // For assessments, we'll use officer count as a proxy since we don't have assessment data per college yet
        const assessments = officers.length * 15; // Approximate assessments per officer
        
        collegeStats.push({
          name: college.name,
          students: students.length,
          officers: officers.length,
          assessments: assessments
        });
      }

      // Sort by student count and return top 5
      return collegeStats
        .sort((a, b) => b.students - a.students)
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting top colleges:', error);
      // Return empty array on error
      return [];
    }
  }

  async getStudentsByCollege(collegeId) {
    try {
      const params = {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': collegeId,
          ':skPrefix': 'STUDENT#'
        }
      };

      const result = await this.queryTable(params);
      return result.Items || [];
    } catch (error) {
      console.error('Error getting students by college:', error);
      return [];
    }
  }

  async getOfficersByCollege(collegeId) {
    try {
      const pk = collegeId.startsWith('CLIENT#') ? collegeId : `CLIENT#${collegeId}`;
      const officers = [];

      // Query for each officer type separately since DynamoDB doesn't support OR in KeyConditionExpression
      const officerPrefixes = [
        'PTO#',                        // Legacy format
        'PTS#',                        // Legacy format
        'Placement Training Officer#',  // New format
        'Placement Training Staff#',    // New format
        'Administrator#'               // Admin format
      ];

      for (const prefix of officerPrefixes) {
        try {
          const params = {
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
            ExpressionAttributeValues: {
              ':pk': pk,
              ':prefix': prefix
            }
          };

          const result = await this.queryTable(params);
          if (result.Items && result.Items.length > 0) {
            officers.push(...result.Items);
          }
        } catch (prefixError) {
          console.error(`Error querying officers with prefix ${prefix}:`, prefixError);
          // Continue with other prefixes
        }
      }

      return officers;
    } catch (error) {
      console.error('Error getting officers by college:', error);
      return [];
    }
  }

  // College Management
  async getAllColleges() {
    try {
      const params = {
        FilterExpression: 'begins_with(PK, :clientPrefix) AND SK = :metadata',
        ExpressionAttributeValues: {
          ':clientPrefix': 'CLIENT#',
          ':metadata': 'METADATA'
        }
      };

      const result = await this.scanTable(params);
      return result.Items.map(item => this.formatCollegeData(item));
    } catch (error) {
      console.error('Error getting all colleges:', error);
      throw error;
    }
  }

  async createCollege(collegeData) {
    try {
      const collegeId = `CLIENT#${collegeData.domain}`;
      const timestamp = new Date().toISOString();

      const college = {
        PK: collegeId,
        SK: 'METADATA',
        name: collegeData.name,
        domain: collegeData.domain,
        clientType: 'college',
        location: collegeData.location || '',
        collegeName: collegeData.name,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: collegeData.createdBy
      };

      await this.putItem(college);
      return this.formatCollegeData(college);
    } catch (error) {
      console.error('Error creating college:', error);
      throw error;
    }
  }

  async getCollegeById(collegeId) {
    try {
      const pk = collegeId.startsWith('CLIENT#') ? collegeId : `CLIENT#${collegeId}`;
      const params = {
        Key: {
          PK: pk,
          SK: 'METADATA'
        }
      };

      const result = await this.getItem(params);
      return result.Item ? this.formatCollegeData(result.Item) : null;
    } catch (error) {
      console.error('Error getting college by ID:', error);
      throw error;
    }
  }

  async updateCollege(collegeId, updates) {
    try {
      const pk = collegeId.startsWith('CLIENT#') ? collegeId : `CLIENT#${collegeId}`;
      
      const updateExpression = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};

      let valueIndex = 0;
      Object.keys(updates).forEach((key) => {
        if (key !== 'PK' && key !== 'SK' && updates[key] !== undefined) {
          updateExpression.push(`#${key} = :val${valueIndex}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:val${valueIndex}`] = updates[key];
          valueIndex++;
        }
      });

      // Always update the timestamp
      updateExpression.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      if (updateExpression.length === 1) {
        throw new Error('No valid fields to update');
      }

      const params = {
        Key: { PK: pk, SK: 'METADATA' },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      };

      const result = await this.updateItem(params);
      return this.formatCollegeData(result.Attributes);
    } catch (error) {
      console.error('Error updating college:', error);
      throw error;
    }
  }

  async deleteCollege(collegeId) {
    try {
      const pk = collegeId.startsWith('CLIENT#') ? collegeId : `CLIENT#${collegeId}`;
      
      // First check if college has users
      const hasUsers = await this.checkCollegeHasUsers(pk);
      if (hasUsers) {
        throw new Error('Cannot delete college with active users');
      }

      const params = {
        Key: {
          PK: pk,
          SK: 'METADATA'
        }
      };

      await this.deleteItem(params);
      return true;
    } catch (error) {
      console.error('Error deleting college:', error);
      throw error;
    }
  }

  async checkCollegeHasUsers(collegeId) {
    try {
      const pk = collegeId.startsWith('CLIENT#') ? collegeId : `CLIENT#${collegeId}`;
      const params = {
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': pk
        },
        Limit: 1
      };

      const result = await this.queryTable(params);
      // Check if there are any records other than METADATA
      return result.Items.some(item => item.SK !== 'METADATA');
    } catch (error) {
      console.error('Error checking college users:', error);
      return false;
    }
  }

  // Officer Management
  async getAllOfficers(filters = {}) {
    try {
      if (filters.collegeId) {
        // Get officers from specific college using the fixed method
        return (await this.getOfficersByCollege(filters.collegeId)).map(item => this.formatOfficerData(item));
      } else {
        // Get all officers from all colleges
        // Use separate scan operations for each officer type since OR in FilterExpression is also problematic in some AWS SDK versions
        const officers = [];
        const officerPrefixes = [
          'PTO#',                        // Legacy format
          'PTS#',                        // Legacy format  
          'Placement Training Officer#',  // New format
          'Placement Training Staff#',    // New format
          'Administrator#'               // Admin format
        ];

        for (const prefix of officerPrefixes) {
          try {
            const params = {
              FilterExpression: 'begins_with(SK, :prefix)',
              ExpressionAttributeValues: {
                ':prefix': prefix
              }
            };
            
            const result = await this.scanTable(params);
            if (result.Items && result.Items.length > 0) {
              officers.push(...result.Items);
            }
          } catch (prefixError) {
            console.error(`Error scanning officers with prefix ${prefix}:`, prefixError);
            // Continue with other prefixes
          }
        }
        
        return officers.map(item => this.formatOfficerData(item));
      }
    } catch (error) {
      console.error('Error getting officers:', error);
      throw error;
    }
  }

  async createOfficer(officerData) {
    try {
      const timestamp = new Date().toISOString();
      const officerId = `${officerData.role}#${uuidv4().substring(0, 8)}`;
      const collegeId = officerData.collegeId.startsWith('CLIENT#') ? officerData.collegeId : `CLIENT#${officerData.collegeId}`;

      // Generate default password that meets Cognito policy: 
      // Must have uppercase, lowercase, numbers, and symbols
      const username = officerData.email;
      const emailPart = username.split('@')[0]; // Get part before @
      const defaultPassword = emailPart.charAt(0).toUpperCase() + emailPart.slice(1) + '123!@#';

      // STEP 1: First create officer record in DynamoDB
      const officer = {
        PK: collegeId,
        SK: officerId,
        name: officerData.name,
        email: officerData.email,
        role: officerData.role,
        department: officerData.department || '',
        phone: officerData.phone || '',
        permissions: officerData.permissions || [],
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: officerData.createdBy,
        defaultPasswordSet: true, // Flag to indicate default password was set
        mustChangePassword: true, // Flag to force password change on first login
        cognitoUserCreated: false // Track Cognito creation status - initialize to false
      };

      await this.putItem(officer);

      // STEP 2: Then create user in Cognito using Admin API
      const { adminCreateUser } = require('../auth/cognito');
      
      try {
        await adminCreateUser(username, defaultPassword, officerData.email, false);
        
        // Update DynamoDB record to mark Cognito user as created
        const updateParams = {
          Key: {
            PK: collegeId,
            SK: officerId
          },
          UpdateExpression: 'SET cognitoUserCreated = :cognitoStatus, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':cognitoStatus': true,
            ':updatedAt': new Date().toISOString()
          }
        };
        await this.updateItem(updateParams);
        officer.cognitoUserCreated = true;
        
      } catch (cognitoError) {
        console.error('Error creating Cognito user:', cognitoError);
        
        // Handle specific Cognito errors
        if (cognitoError.code === 'UsernameExistsException') {
          console.log(`User ${username} already exists in Cognito, marking as created`);
          // Update DynamoDB to mark Cognito user as created (already exists)
          const updateParams = {
            Key: {
              PK: collegeId,
              SK: officerId
            },
            UpdateExpression: 'SET cognitoUserCreated = :cognitoStatus, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
              ':cognitoStatus': true,
              ':updatedAt': new Date().toISOString()
            }
          };
          await this.updateItem(updateParams);
          officer.cognitoUserCreated = true;
        } else {
          // For other Cognito errors, log but don't fail the entire operation
          // The officer record exists in DynamoDB, admin can retry Cognito creation later
          console.error(`Failed to create Cognito user for ${username}:`, cognitoError.message);
          
          // Update DynamoDB with error info
          const updateParams = {
            Key: {
              PK: collegeId,
              SK: officerId
            },
            UpdateExpression: 'SET cognitoUserCreated = :cognitoStatus, cognitoError = :error, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
              ':cognitoStatus': false,
              ':error': cognitoError.message,
              ':updatedAt': new Date().toISOString()
            }
          };
          await this.updateItem(updateParams);
          
          // Include warning in response but don't fail
          officer.cognitoUserCreated = false;
          officer.cognitoError = cognitoError.message;
        }
      }

      // Return formatted officer data
      const formattedOfficer = this.formatOfficerData(officer);
      
      // Add default password info to response (for admin notification)
      formattedOfficer.defaultPassword = defaultPassword;
      formattedOfficer.loginInstructions = officer.cognitoUserCreated 
        ? `Default password: ${defaultPassword}. User must change password on first login.`
        : `Officer created in database. Authentication account creation ${officer.cognitoError ? 'failed: ' + officer.cognitoError : 'pending'}.`;
      
      return formattedOfficer;
    } catch (error) {
      console.error('Error creating officer:', error);
      throw error;
    }
  }

  async resetOfficerPassword(officerId) {
    try {
      // First find the officer to get their email
      const officer = await this.findOfficerById(officerId);
      
      if (!officer) {
        throw new Error('Officer not found');
      }

      // Generate new password using same format as creation
      const username = officer.email;
      const emailPart = username.split('@')[0];
      const newPassword = emailPart.charAt(0).toUpperCase() + emailPart.slice(1) + '123!@#';
      
      // Reset password in Cognito
      const { adminResetUserPassword } = require('../auth/cognito');
      await adminResetUserPassword(username, newPassword);
      
      // Update DynamoDB record to reflect password reset
      const updateParams = {
        Key: {
          PK: officer.PK,
          SK: officer.SK
        },
        UpdateExpression: 'SET mustChangePassword = :mustChange, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':mustChange': true,
          ':updatedAt': new Date().toISOString()
        }
      };
      await this.updateItem(updateParams);
      
      return {
        success: true,
        message: 'Password reset successfully',
        newPassword: newPassword,
        email: officer.email,
        instructions: `New password: ${newPassword}. User must change password on first login.`
      };
    } catch (error) {
      console.error('Error resetting officer password:', error);
      throw error;
    }
  }

  // Admin Profile Management Methods
  async getAdminProfile(email) {
    try {
      // First try to get profile from database
      const params = {
        Key: {
          PK: 'ADMIN#PROFILE',
          SK: `USER#${email}`
        }
      };

      const result = await this.getItem(params);
      
      if (result.Item) {
        return {
          id: result.Item.SK,
          name: result.Item.name,
          email: result.Item.email,
          role: result.Item.role || 'Admin',
          department: result.Item.department,
          phone: result.Item.phone,
          createdAt: result.Item.createdAt,
          updatedAt: result.Item.updatedAt
        };
      }

      // If not found in database, get from Cognito and create profile
      const { getUserAttributes } = require('../auth/cognito');
      try {
        const userAttributes = await getUserAttributes(email);
        const attributeMap = userAttributes.reduce((acc, attr) => {
          acc[attr.Name] = attr.Value;
          return acc;
        }, {});

        // Create initial profile from Cognito data
        const profile = {
          id: `USER#${email}`,
          name: attributeMap.name || attributeMap.given_name || 'Admin User',
          email: email,
          role: attributeMap['custom:role'] || 'Admin',
          department: attributeMap['custom:department'] || '',
          phone: attributeMap.phone_number || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Save to database
        await this.putItem({
          PK: 'ADMIN#PROFILE',
          SK: `USER#${email}`,
          ...profile
        });

        return profile;
      } catch (cognitoError) {
        console.error('Error fetching from Cognito:', cognitoError);
        // Return minimal profile if Cognito fails
        return {
          id: `USER#${email}`,
          name: 'Admin User',
          email: email,
          role: 'Admin',
          department: '',
          phone: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error getting admin profile:', error);
      throw error;
    }
  }

  async updateAdminProfile(profileData) {
    try {
      const timestamp = new Date().toISOString();
      
      const updateParams = {
        Key: {
          PK: 'ADMIN#PROFILE',
          SK: `USER#${profileData.email}`
        },
        UpdateExpression: 'SET #name = :name, email = :email, department = :department, phone = :phone, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': profileData.name,
          ':email': profileData.email,
          ':department': profileData.department || '',
          ':phone': profileData.phone || '',
          ':updatedAt': timestamp
        },
        ReturnValues: 'ALL_NEW'
      };

      const result = await this.updateItem(updateParams);
      return {
        id: result.Attributes.SK,
        name: result.Attributes.name,
        email: result.Attributes.email,
        role: result.Attributes.role || 'Admin',
        department: result.Attributes.department,
        phone: result.Attributes.phone,
        createdAt: result.Attributes.createdAt,
        updatedAt: result.Attributes.updatedAt
      };
    } catch (error) {
      console.error('Error updating admin profile:', error);
      throw error;
    }
  }

  async changeAdminPassword(email, currentPassword, newPassword) {
    try {
      // First verify current password with Cognito
      const { loginUser } = require('../auth/cognito');
      
      try {
        await loginUser(email, currentPassword);
      } catch (loginError) {
        throw new Error('Current password is incorrect');
      }

      // Update password in Cognito
      const { adminResetUserPassword } = require('../auth/cognito');
      await adminResetUserPassword(email, newPassword);

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Error changing admin password:', error);
      throw error;
    }
  }

  // Branding Settings Management
  async getBrandingSettings() {
    try {
      const params = {
        Key: {
          PK: 'SYSTEM#SETTINGS',
          SK: 'BRANDING#CONFIG'
        }
      };

      const result = await this.getItem(params);
      return result.Item || {
        companyName: 'Placipy Assessment Platform',
        primaryColor: '#9768E1',
        secondaryColor: '#523C48',
        theme: 'light'
      };
    } catch (error) {
      console.error('Error getting branding settings:', error);
      return {};
    }
  }

  async updateBrandingSettings(brandingData) {
    try {
      const timestamp = new Date().toISOString();
      
      const params = {
        Key: {
          PK: 'SYSTEM#SETTINGS',
          SK: 'BRANDING#CONFIG'
        },
        UpdateExpression: 'SET companyName = :companyName, primaryColor = :primaryColor, secondaryColor = :secondaryColor, theme = :theme, logo = :logo, updatedAt = :updatedAt, updatedBy = :updatedBy',
        ExpressionAttributeValues: {
          ':companyName': brandingData.companyName,
          ':primaryColor': brandingData.primaryColor,
          ':secondaryColor': brandingData.secondaryColor,
          ':theme': brandingData.theme,
          ':logo': brandingData.logo || null,
          ':updatedAt': timestamp,
          ':updatedBy': brandingData.updatedBy
        },
        ReturnValues: 'ALL_NEW'
      };

      const result = await this.updateItem(params);
      return result.Attributes;
    } catch (error) {
      console.error('Error updating branding settings:', error);
      throw error;
    }
  }

  // Email Template Management
  async getEmailTemplates() {
    try {
      const params = {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': 'SYSTEM#TEMPLATES',
          ':skPrefix': 'EMAIL#'
        }
      };

      const result = await this.queryTable(params);
      return result.Items?.map(item => ({
        id: item.SK.replace('EMAIL#', ''),
        name: item.name,
        subject: item.subject,
        content: item.content,
        type: item.type,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })) || [];
    } catch (error) {
      console.error('Error getting email templates:', error);
      return [];
    }
  }

  async createEmailTemplate(templateData) {
    try {
      const templateId = `${templateData.type}-${Date.now()}`;
      const timestamp = new Date().toISOString();
      
      const template = {
        PK: 'SYSTEM#TEMPLATES',
        SK: `EMAIL#${templateId}`,
        name: templateData.name,
        subject: templateData.subject,
        content: templateData.content,
        type: templateData.type,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: templateData.createdBy
      };

      await this.putItem(template);
      
      return {
        id: templateId,
        name: template.name,
        subject: template.subject,
        content: template.content,
        type: template.type,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      };
    } catch (error) {
      console.error('Error creating email template:', error);
      throw error;
    }
  }

  async updateEmailTemplate(templateId, templateData) {
    try {
      const params = {
        Key: {
          PK: 'SYSTEM#TEMPLATES',
          SK: `EMAIL#${templateId}`
        },
        UpdateExpression: 'SET #name = :name, subject = :subject, content = :content, updatedAt = :updatedAt, updatedBy = :updatedBy',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': templateData.name,
          ':subject': templateData.subject,
          ':content': templateData.content,
          ':updatedAt': new Date().toISOString(),
          ':updatedBy': templateData.updatedBy
        },
        ReturnValues: 'ALL_NEW'
      };

      const result = await this.updateItem(params);
      
      return {
        id: templateId,
        name: result.Attributes.name,
        subject: result.Attributes.subject,
        content: result.Attributes.content,
        type: result.Attributes.type,
        createdAt: result.Attributes.createdAt,
        updatedAt: result.Attributes.updatedAt
      };
    } catch (error) {
      console.error('Error updating email template:', error);
      throw error;
    }
  }

  async deleteEmailTemplate(templateId) {
    try {
      const params = {
        Key: {
          PK: 'SYSTEM#TEMPLATES',
          SK: `EMAIL#${templateId}`
        }
      };

      await this.deleteItem(params);
      return { success: true };
    } catch (error) {
      console.error('Error deleting email template:', error);
      throw error;
    }
  }

  async updateOfficer(officerId, updates) {
    try {
      // First find the officer to get the PK
      const officer = await this.findOfficerById(officerId);
      
      if (!officer) {
        throw new Error('Officer not found');
      }

      const updateExpression = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};

      let valueIndex = 0;
      Object.keys(updates).forEach((key) => {
        if (key !== 'PK' && key !== 'SK' && updates[key] !== undefined) {
          updateExpression.push(`#${key} = :val${valueIndex}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:val${valueIndex}`] = updates[key];
          valueIndex++;
        }
      });

      updateExpression.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      if (updateExpression.length === 1) {
        throw new Error('No valid fields to update');
      }

      const params = {
        Key: { PK: officer.PK, SK: officer.SK },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      };

      const result = await this.updateItem(params);
      return this.formatOfficerData(result.Attributes);
    } catch (error) {
      console.error('Error updating officer:', error);
      throw error;
    }
  }

  async deleteOfficer(officerId) {
    try {
      const officer = await this.findOfficerById(officerId);
      if (!officer) {
        throw new Error('Officer not found');
      }

      const params = {
        Key: {
          PK: officer.PK,
          SK: officer.SK
        }
      };

      await this.deleteItem(params);
      return true;
    } catch (error) {
      console.error('Error deleting officer:', error);
      throw error;
    }
  }

  // Helper Methods
  async findOfficerById(officerId) {
    try {
      // Scan for officer across all colleges
      const params = {
        FilterExpression: 'SK = :officerId',
        ExpressionAttributeValues: {
          ':officerId': officerId
        }
      };

      const result = await this.scanTable(params);
      return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    } catch (error) {
      console.error('Error finding officer:', error);
      return null;
    }
  }

  async getAllStudents() {
    try {
      const params = {
        FilterExpression: 'begins_with(SK, :studentPrefix)',
        ExpressionAttributeValues: {
          ':studentPrefix': 'STUDENT#'
        }
      };

      const result = await this.scanTable(params);
      return result.Items.map(item => this.formatStudentData(item));
    } catch (error) {
      console.error('Error getting students:', error);
      throw error;
    }
  }

  async getAllDepartments(collegeId = null) {
    try {
      let params;

      if (collegeId) {
        params = {
          FilterExpression: 'begins_with(PK, :deptPrefix)',
          ExpressionAttributeValues: {
            ':deptPrefix': 'DEPARTMENT'
          }
        };
      } else {
        params = {
          FilterExpression: 'begins_with(PK, :deptPrefix)',
          ExpressionAttributeValues: {
            ':deptPrefix': 'DEPARTMENT'
          }
        };
      }

      const result = await this.scanTable(params);
      return result.Items.map(item => this.formatDepartmentData(item));
    } catch (error) {
      console.error('Error getting departments:', error);
      throw error;
    }
  }

  async getAllAssessments(filters = {}) {
    try {
      let params = {
        FilterExpression: 'begins_with(PK, :assessPrefix)',
        ExpressionAttributeValues: {
          ':assessPrefix': 'ASSESSMENT'
        }
      };

      if (filters.status) {
        params.FilterExpression += ' AND #status = :status';
        params.ExpressionAttributeNames = { '#status': 'status' };
        params.ExpressionAttributeValues[':status'] = filters.status;
      }

      const result = await this.scanTable(params);
      return result.Items.map(item => this.formatAssessmentData(item));
    } catch (error) {
      console.error('Error getting assessments:', error);
      throw error;
    }
  }

  async getRecentActivity() {
    try {
      // Get recent items (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const params = {
        FilterExpression: '#updatedAt > :sevenDaysAgo',
        ExpressionAttributeNames: {
          '#updatedAt': 'updatedAt'
        },
        ExpressionAttributeValues: {
          ':sevenDaysAgo': sevenDaysAgo.toISOString()
        },
        Limit: 10
      };

      const result = await this.scanTable(params);
      return result.Items.map(item => ({
        type: this.getEntityType(item),
        action: 'updated',
        timestamp: item.updatedAt,
        details: this.getActivityDetails(item)
      }));
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  // Reporting Methods
  async getPerformanceReport(filters = {}) {
    try {
      const assessments = await this.getAllAssessments(filters);
      const colleges = await this.getAllColleges();
      
      return {
        assessmentPerformance: assessments.map(assessment => ({
          id: assessment.id,
          name: assessment.name,
          department: assessment.department,
          status: assessment.status,
          attempts: assessment.attempts || 0
        })),
        collegePerformance: colleges.map(college => ({
          id: college.id,
          name: college.name,
          totalUsers: 0, // Will be calculated
          activeAssessments: assessments.filter(a => a.collegeId === college.id).length
        }))
      };
    } catch (error) {
      console.error('Error generating performance report:', error);
      throw error;
    }
  }

  async getCollegeReports() {
    try {
      const colleges = await this.getAllColleges();
      const reports = [];

      for (const college of colleges) {
        const officers = await this.getAllOfficers({ collegeId: college.id });
        const students = await this.getStudentsByCollege(college.id);
        
        reports.push({
          college: college,
          stats: {
            totalOfficers: officers.length,
            totalStudents: students.length,
            departments: await this.getDepartmentsByCollege(college.id)
          }
        });
      }

      return reports;
    } catch (error) {
      console.error('Error generating college reports:', error);
      throw error;
    }
  }

  // System Settings
  async getSystemSettings() {
    try {
      const params = {
        Key: {
          PK: 'GLOBAL#SETTINGS',
          SK: 'CONFIG'
        }
      };

      const result = await this.getItem(params);
      return result.Item || {
        theme: 'light',
        emailNotifications: true,
        defaultLanguage: 'en',
        systemName: 'Assessment Platform'
      };
    } catch (error) {
      console.error('Error getting system settings:', error);
      throw error;
    }
  }

  async updateSystemSettings(settings) {
    try {
      const timestamp = new Date().toISOString();
      
      const item = {
        PK: 'GLOBAL#SETTINGS',
        SK: 'CONFIG',
        ...settings,
        updatedAt: timestamp
      };

      await this.putItem(item);
      return item;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  // Data Formatting Methods
  formatCollegeData(item) {
    return {
      id: item.PK,
      name: item.collegeName || item.name || '',
      domain: item.domain || '',
      location: item.location || '',
      clientType: item.clientType || 'college',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      active: item.active !== undefined ? item.active : true // Use stored value or default to active
    };
  }

  // Helper method to normalize legacy role formats
  normalizeRole(role) {
    if (!role) return 'Placement Training Officer'; // Default for empty roles
    
    switch (role.toLowerCase()) {
      case 'pto':
        return 'Placement Training Officer';
      case 'pts':
        return 'Placement Training Staff';
      case 'admin':
        return 'Administrator';
      default:
        // If already in new format, return as-is
        return role;
    }
  }

  formatOfficerData(item) {
    return {
      id: item.SK,
      name: item.name || '',
      email: item.email || '',
      role: this.normalizeRole(item.role),
      department: item.department || '',
      phone: item.phone || '',
      collegeId: item.PK,
      collegeName: '', // Will be populated from college data if needed
      permissions: item.permissions || [],
      status: item.status || 'ACTIVE', // Use stored status or default to ACTIVE
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      // Include authentication-related fields
      cognitoUserCreated: item.cognitoUserCreated,
      cognitoError: item.cognitoError,
      defaultPasswordSet: item.defaultPasswordSet,
      mustChangePassword: item.mustChangePassword
    };
  }

  formatStudentData(item) {
    return {
      id: item.SK,
      name: item.name || '',
      email: item.email || '',
      department: item.department || '',
      year: item.year || '',
      collegeId: item.PK,
      role: 'Student'
    };
  }

  formatDepartmentData(item) {
    return {
      id: item.id,
      name: item.name || '',
      code: item.code || '',
      createdAt: item.createdAt
    };
  }

  formatAssessmentData(item) {
    return {
      id: item.id,
      name: item.name || '',
      department: item.department || '',
      status: item.status || 'inactive',
      duration: item.duration || 60,
      attempts: item.attempts || 0,
      type: item.type || 'college-wide',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }

  getEntityType(item) {
    if (item.PK.startsWith('CLIENT#')) return 'college';
    if (item.PK.startsWith('ASSESSMENT')) return 'assessment';
    if (item.PK.startsWith('DEPARTMENT')) return 'department';
    if (item.SK.startsWith('PTO#')) return 'officer';
    if (item.SK.startsWith('PTS#')) return 'officer';
    if (item.SK.startsWith('STUDENT#')) return 'student';
    return 'unknown';
  }

  getActivityDetails(item) {
    const type = this.getEntityType(item);
    const name = item.name || item.collegeName || item.email || 'Unknown';
    return { type, name };
  }

  // Helper methods for college-specific data
  async getStudentsByCollege(collegeId) {
    try {
      const pk = collegeId.startsWith('CLIENT#') ? collegeId : `CLIENT#${collegeId}`;
      const params = {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :studentPrefix)',
        ExpressionAttributeValues: {
          ':pk': pk,
          ':studentPrefix': 'STUDENT#'
        }
      };

      const result = await this.queryTable(params);
      return result.Items.map(item => this.formatStudentData(item));
    } catch (error) {
      console.error('Error getting students by college:', error);
      return [];
    }
  }

  async getDepartmentsByCollege(collegeId) {
    try {
      // This would need to be implemented based on how departments are linked to colleges
      return [];
    } catch (error) {
      console.error('Error getting departments by college:', error);
      return [];
    }
  }
}

module.exports = AdminService;